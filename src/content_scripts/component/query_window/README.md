https://github.com/Selection-Translator/crx-selection-translate/issues/534


* 有道移动版
* 必应移动版

# 增加快捷方式，跳转到各个翻译网站。单独做管理？
# 这个好
# 移动版页面？

# 中文查生僻字

# 允许重新发送翻译请求(刷新按钮)

# Bing 提取网页的结果（中文必应好搞，那国际Bing怎么办？）

# 定位：1.基本的单词字典查找功能 2. 长句翻译功能 3. 使用iframe 内嵌裁剪显示结果
[x] 使用一个稳定的接口提供音标

1. 手动发起html请求，标记，修改UA，得到移动版页面
2. 转换成base64，用 iframe 的 srcdoc 加载
3. 注入脚本或样式，裁剪元素