import LoginService from "./LoginService";

let loginService: LoginService;
let isInit: boolean;
let isDestroy: boolean;

async function initServices(): Promise<void> {
  if (!isInit) {
    await loginService.init();
  }
  isInit = true;
}

async function destroyServices(): Promise<void> {
  if (!isDestroy) {
    await loginService.destroy();
  }
  isDestroy = true;
}

export function useServices(): {
  loginService: LoginService;
  initServices: () => Promise<void>;
  destroyServices: () => Promise<void>;
} {
  if (!loginService) {
    loginService = new LoginService();
  }
  return {
    loginService,
    initServices,
    destroyServices,
  };
}
