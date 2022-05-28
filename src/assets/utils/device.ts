export enum DeviceType {
  Phone = 'Phone',
  PC = 'PC',
}

export function defineDevice(width = window.innerWidth): DeviceType {
  if (width <= 768) {
    return DeviceType.Phone;
  }
  return DeviceType.PC;
}
