const WebSocket = require('ws');

const logger = require('../util/loggerutil')('%c[TCHost]', 'color: #202dfa; font-weight: bold');

const updateTypes = {
  RPC: "rpc",
  ACK: "ack",
  PONG: "pong",
  PING: "ping", // only client side
};

const updateReducers = {};

const addReducer = (name, reducer) => {
  if (!updateReducers[name]) { // if no reducers for this name
    updateReducers[name] = []; // create empty
  }
  updateReducers[name].push(reducer);
};

/**
 * Build TCUpdate object
 * @param {string} type - type of update
 * @param {object} data - payload of update
 * @param {number} msgId - message id (optional)
 * @returns {object} - TCUpdate
 */
const buildUpdate = (type, data = null, msgId = 0) => ({
  type: type,
  data: data,
  msgId: msgId,
});

/**
 * Create RPC Response object
 * @param {object} payload - response payload
 * @param {number} regId - request ID
 * @returns {object} - plain TCUpdate object
 */
const RPCResponse = (payload = {}, regId = 0) => {
  return buildUpdate(updateTypes.RPC, {
    payload: payload,
    regId: regId,
  });
}

/**
 * Create ACK Response object
 * @param {string} name - name of ACK response
 * @param {object} payload - response payload
 * @returns {object} - plain TCUpdate object
 */
const ACKResponse = (name, payload = {}) => {
  return buildUpdate(updateTypes.ACK, {
    type: name,
    payload: payload,
  });
}

/**
 * Create PONG Response object
 * @param {number} pingId - ping id
 * @returns {object} - plain TCUpdate object
 */
const PongResponse = (pingId = 0) => {
  return buildUpdate(updateTypes.PONG, {
    pongId: pingId
  });
}


/**
 * Handle TCUpdate request
 * @param {object} update - parsed message request
 * @returns {object} - reduced update for RPC
 */
async function handleTCUpdate(update) {
  let response;
  if (update.type == updateTypes.PING) {
    response = PongResponse(update.data.pingId);
  } else if (updateReducers[update.type]) {
    response = await updateReducers[update.type].reduce(async (acc, reducer, idx) => {
      const response = await reducer(update.data); // request update from reducer
      if (response != undefined) acc = Object.assign({}, acc, response); // assign current state with new state
      return acc; // return current state
    }, undefined);
    if (response != undefined) {
      response = RPCResponse(response, update.msgId);
    }
  }
  if (response == undefined) {
    response = buildUpdate("error", { message: "Unknown wsapisx request" });
  }
  return response;
}

/**
 * Generate request id,
 * based on current time
 * @returns {number} - generated hash
 */
function generateRequestId() {
  const now = new Date().getTime() / 1000;
  const nanoseconds = Math.floor((now - Math.floor(now)) * 1e9);
  return Math.floor(now) << 32 || Math.floor(nanoseconds) << 2;
}

/**
 * Pack data to message body
 * @param {object} update - TCUpdate
 * @returns {string} - packed message data
 */
const socketPacker = (update) => {
  //console.debug(">> PACK", update);
  let body;
  let payload;
  try {
    payload = Object.assign({}, {
      type: update.type || undefined,
      msgId: update.msgId || generateRequestId(),
      data: update.data || undefined,
    });
    payload = Object.fromEntries(Object.entries(payload).filter(([k, v]) => v != null));
  } catch (e) {
    return;
  }
  try {
    body = JSON.stringify(payload);
  } catch (e) {
    return;
  }
  return body;
}

/**
 * Pack data for electron update
 * @param {object} update - TCUpdate
 * @returns
 */
const senderPacker = (update) => {
  let payload;
  try {
    payload = Object.assign({}, {
      type: update.type,
      data: update.data,
    });
    payload = Object.fromEntries(Object.entries(payload).filter(([k, v]) => v != null));
  } catch (e) {
    return;
  }
  return payload;
}

/**
 * Unpack data from message body
 * @param {string} body - packed message data
 * @returns {object} - unpacked message data
 */
const socketUnpacker = (body) => {
  let type;
  let msgId;
  let data;
  try {
    body = JSON.parse(body);
  } catch (e) {
    return;
  }
  try {
    type = body['type'];
    msgId = body['msgId'];
    data = body['data'];
  } catch (e) {
    return;
  }
  return Object.seal({
    type: type,
    msgId: msgId,
    data: data,
  });
}

/**
 * Unpack data from electron message body
 * @param {object} body - packed message data
 */
const senderUnpacker = (eventName, body) => {
  return Object.seal({
    type: eventName,
    data: body,
  });
}

class TCSender { // TCClient instance

  static DEFAULT_PARAMS = {
    updateCallback: undefined
  };

  constructor(connection, opts = {}) {
    const args = Object.assign({}, TCSender.DEFAULT_PARAMS, opts);
    this.updateCallback = args.updateCallback;
    this.connection = connection;
    this.handlers = {
      ["open"]: this.handleOpen,
      ["close"]: this.handleClose,
      ["message"]: this.handleMessage.bind(this),
      ["error"]: this.handleError.bind(this),
    };
    Object.keys(this.handlers).forEach(event => this.connection.on(event, this.handlers[event]));
  }

  handleOpen() { } // Not implemented

  handleClose(code, reason) { } // Not implemented

  /**
   *
   * @param {string|buffer} data
   * @param {*} isBinary
   */
  async handleMessage(data, isBinary) {
    // console.debug(">> SS RECV", data);
    data = socketUnpacker(data); // unpack message
    const update = await handleTCUpdate(data); // handle update
    if (update != undefined) this.sendMessage(update); // send like rpc result
  }

  handleError(err) { }

  sendMessage(update) {
    const body = socketPacker(update);
    // console.debug(">>> SS SEND", body);
    if (body) this.connection.send(body);
  }

}

class TCHost { // TCHost connector instance

  /**
   * TCHost default parameters
   */
  static DEFAULT_PARAMS = {
    port: 4836
  };

  /**
   * Socket server instance
   * @type {WebSocket.Server}
   */
  socket = undefined;

  /**
   * Clients map
   * @type {Map<WebSocket.WebSocket, TCSender>}
   */
  clients = new Map();

  /**
   * RPC/Ack senders
   * for electron window events
   * @type {Map<string, function>}
   */
  senders = new Map();

  constructor(params = {}) {
    this.params = Object.assign({}, TCHost.DEFAULT_PARAMS, params);
    this.handlers = {
      ["listening"]: this.handleListening.bind(this),
      ["connection"]: this.handleConnection.bind(this),
      ["close"]: this.handleClose.bind(this),
      ["error"]: this.handleError.bind(this),
    };
  }

  /**
   * Initialize TCHost instance
   * @returns {WebSocket.Server|undefined} - returns the instance of WebSocket server or nothing
   */
  start() {
    try {
      this.socket = new WebSocket.Server(this.params);
    } catch (e) {
      logger.error("Error while starting TCSocket server", e);
      return;
    }
    try {
      Object.keys(this.handlers).forEach(event => this.socket.on(event, this.handlers[event]));
    } catch (e) {
      logger.error("Error while binding handlers to TCSocket");
      return;
    }
    return this.socket;
  }

  handleListening() {
    logger.debug("Listening...");
  }

  /**
   * Handle a new connection
   * @param {WebSocket.WebSocket} client - WebSocket client instance
   */
  handleConnection(client) {
    const sender = new TCSender(client); // create TCSender
    this.clients.set(client, sender);
    this.emit("new_conn");
  }

  handleClose() { } // Not implemented

  handleError() { } // Not implemented

  /**
   * Emit Actionknowledge of host event
   * @param {string} type - ack type (event name)
   * @param {object} payload - ack payload (event payload)
   * @param {boolean} localOnly - send event only to electron
   */
  emit(type, payload = {}, localOnly = false) {
    const update = ACKResponse(type, payload);
    if (update != undefined) {
      {
        const sender = this.senders.get(update.type);
        if (sender) {
          const senderBody = senderPacker(update);
          //console.debug(">>> IPC EMIT", senderBody);
          sender(update.type, senderBody);
        }
      }
      if (localOnly) return;
      {
        const socketBody = socketPacker(update);
        //console.debug(">>> SS EMIT", socketBody);
        this.socket.clients.size &&
          this.socket.clients.forEach((client) => client.send(socketBody));
      }
    }
  }

  /**
   * Handle IPC Invoke
   * @param {string} channel
   * @returns {function}
   */
  handleIPCInvoke(channel) {
    return async (event, data) => {
      // console.debug(">> IPC INV RECV", channel, "->", data);
      data = senderUnpacker(channel, data);
      const update = await handleTCUpdate(data);
      if (update != undefined) {
        // console.debug(">> IPC INV SEND", channel, "->", update);
        return update;
      }
      return false;
    }
  }

  /**
   * Add Sender for electron updates
   * @param {string} type - type of update
   * @param {function} sender - sender function
   */
  addSender(type, sender) {
    if (typeof sender === 'function') {
      this.senders.set(type, sender);
    }
  }

  // Class exports from global
  addReducer = addReducer;
  updateTypes = updateTypes;
}

module.exports = TCHost;