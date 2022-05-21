export enum Events {
  // inner module communication events
  /**
   * To init all state
   */
  Module_ToRecover = 'Module_ToRecover',
  // To close img viewer
  Module_ToClose = 'Module_ToClose',
  // img zone touch events forwarding
  Module_TouchEvent = 'Module_TouchEvent',

  /**
   * img viewer is closed
   */
  Closed = 'Closed',
}
