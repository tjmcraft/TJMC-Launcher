## Tasks 📑
### UI improvements:
- [x] Implement **Context Menu** on **Installations**
- [x] Implement **Full Delete** action on **Installations** (deep delete -> all dependencies)
- [x] Implement **Edit** action on **Installations**
- [x] Implement open current installation folder
- [ ] Fix accessibility issues (aria tags + tab navigation)
- [ ] Implement font resize + *accent color change*
- [x] Fix non-centred main window on first start #28
- [x] Fix fullscreen after reloading UI #27
- [ ] Move **Settings** to separate layer (not modal)
- [x] Add versions search
- [ ] Add Installations search
- [x] Full support hot keys
### Host improvements:
- [x] Create **JavaManager**, that can **install** required java and also scan **installed** versions
- [x] Fix Forge and other *modded* builds startup issues
- [x] Fix directories bug and create directories setting
- [x] Installations:
  - [x] Prevent loading same installation as a second instance in host launcher (strict)
  - [x] Implement installations load queue #34
  - [x] Implement *last-used* time on **Installation** #31
- [ ] Auth improvements:
  - [x] Update **Auth** system (move to host as auth server + oauth on web)
  - [x] Offline account support
  - [x] Connect to keytar store
  - [x] Implement multi-account store
  - [x] Refresh token support #33
  - [ ] Implement next **TCHost** (WebRTC) under Host (need for host auth system to authorize in signaling server)
