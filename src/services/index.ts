import LoginService from "./LoginService";
import SocialRecoveryService from "./SocialRecoveryService";
import AccessBackService from "./AccessBackService";
import GrantAccessService from "./GrantAccessService";

let loginService: LoginService;
let socialRecoveryService: SocialRecoveryService;
let accessBackService: AccessBackService;
let grantAccessService: GrantAccessService;
let isInit: boolean;
let isDestroy: boolean;

async function initServices(): Promise<void> {
  if (!isInit) {
    await loginService.init();
    await socialRecoveryService.init();
    await accessBackService.init();
    await grantAccessService.init();
  }
  isInit = true;
}

async function destroyServices(): Promise<void> {
  if (!isDestroy) {
    await loginService.destroy();
    await socialRecoveryService.destroy();
    await accessBackService.destroy();
    await grantAccessService.destroy();
  }
  isDestroy = true;
}

export function useServices(): {
  loginService: LoginService;
  socialRecoveryService: SocialRecoveryService;
  accessBackService: AccessBackService;
  grantAccessService: GrantAccessService;
  initServices: () => Promise<void>;
  destroyServices: () => Promise<void>;
} {
  if (!loginService) {
    loginService = new LoginService();
  }
  if (!socialRecoveryService) {
    socialRecoveryService = new SocialRecoveryService();
  }
  if (!accessBackService) {
    accessBackService = new AccessBackService();
  }
  if (!grantAccessService) {
    grantAccessService = new GrantAccessService();
  }
  return {
    loginService,
    socialRecoveryService,
    accessBackService,
    grantAccessService,
    initServices,
    destroyServices,
  };
}
