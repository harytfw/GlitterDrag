* 检测旧配置迁移到新配置是否正常
* 对1.x版本升级到2.x版本的用户，主动弹出迁移提示
* 针对1.x版本的兼容性问题，将解决方案迁移到2.x版本中
* 对比1.x版本和2.x版本的功能上的差异，想办法同步实现
    * 图片搜索功能
    * 外部拖拽功能
    * 等等
* i18n 国际化问题
* 允许名单和阻止名单

[x] 自定义按键的功能行不通，在拖拽过程只有 Ctrl, Shift, Alt 能从 drag事件中的 modifierKey 获得， 其他事件像 keydown, keypress, keyup 事件都不会被出发，那么就无法获得当前用户按下的快捷键

[ ] 分离 翻译，字典等外部查询部件（对应 query_window文件夹）。放在另一个扩展中，以提供API的方式实现

[ ] iframe的兼容性要如何实现？这个问题还需要详细的讨论.

[ ] 预计出正式版的时间为 9月底，在10月1号有足够的时间来修复bug。



[] 项目结构调整
[] 迁移测试
[] 搜索引擎界面调整，优化
[] 允许列表、屏蔽列表实现
[] 链接类型支持下载动作