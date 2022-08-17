export const close = (dropdown?: HTMLElement) => {
  dropdown?.classList.remove("is-active");
};

export const open = (dropdown?: HTMLElement) => {
  dropdown?.classList.add("is-active");
};

export const isOpen = (dropdown?: HTMLElement) => {
  return !!dropdown?.classList.contains("is-active");
};

export const toggle = (dropdown?: HTMLElement) => {
  if (isOpen(dropdown)) {
    close(dropdown);
  } else {
    open(dropdown);
  }
};
