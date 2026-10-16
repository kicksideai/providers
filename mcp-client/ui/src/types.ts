export interface ConnectProps { componentId?: string }
export interface ConnectEvents {
  'connection-saved': { success: boolean; component_id?: string; error?: string }
}
export interface PickerConfig {
  connection_id?: string
  selected_tools?: string[]
  tool_prefix?: string
}
export interface PickerProps { config?: PickerConfig | null }
export interface PickerEvents { 'config-changed': PickerConfig }
