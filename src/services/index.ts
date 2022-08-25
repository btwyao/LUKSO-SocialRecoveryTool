import LoginService from "./LoginService";
import SocialRecoveryService from "./SocialRecoveryService";

let loginService: LoginService;
let socialRecoveryService: SocialRecoveryService;
let isInit: boolean;
let isDestroy: boolean;

async function initServices(): Promise<void> {
  if (!isInit) {
    await loginService.init();
    await socialRecoveryService.init();
  }
  isInit = true;
}

async function destroyServices(): Promise<void> {
  if (!isDestroy) {
    await loginService.destroy();
    await socialRecoveryService.destroy();
  }
  isDestroy = true;
}

export function useServices(): {
  loginService: LoginService;
  socialRecoveryService: SocialRecoveryService;
  initServices: () => Promise<void>;
  destroyServices: () => Promise<void>;
} {
  if (!loginService) {
    loginService = new LoginService();
  }
  if (!socialRecoveryService) {
    socialRecoveryService = new SocialRecoveryService();
  }
  return {
    loginService,
    socialRecoveryService,
    initServices,
    destroyServices,
  };
}
