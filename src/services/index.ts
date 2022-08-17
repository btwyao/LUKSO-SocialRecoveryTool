import LoginService from "./LoginService";

let loginService: LoginService;

async function initServices(): Promise<void> {
  await loginService.init();
}

async function destroyServices(): Promise<void> {
  await loginService.destroy();
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
