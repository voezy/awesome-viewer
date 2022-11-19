export enum Events {
  // inner module communication events
  /**
   * To init all state
   */
  Module_ToRecover = 'Module_ToRecover',
  // To close img viewer
  Module_ToClose = 'Module_ToClose',
  // img zone gesture events forwarding
  Module_GestureEvent = 'Module_GestureEvent',
  // To open image information drawer
  Module_ToOpenInfo = 'Module_ToOpenInfo',
  // Image data forward
  Module_ImgData = 'Module_ImgData',
  // window/document events
  Module_WindowResize = 'Module_WindowResize',
  Module_SwitchToIndex = 'Module_SwitchToIndex',
  // img container mouse events forwarding
  Module_MouseEvent = 'Module_MouseEvent',

  /**
   * img viewer is closed
   */
  Closed = 'Closed',
}
