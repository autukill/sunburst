# 关于

安规模拟考试程序.

## 演示地址

国内: <https://autukill.gitee.io/exam/>

## 题库格式要求

- 编码格式 UTF-8
- 每行文本开头没有空格
- 文本"Answer:A"中的冒号使用":"
- 大写的选项序列"ABCDEF..."

## 缓存问题

修改程序后,需要手动编辑版本号,涉及以下文件

- index.html 
- config.js

## 在题目中显示图片

要在题目描述和选项中显示任意图片. 可在 txt 题库中插入 img 标签.

说明: 
 - img 标签的 src 属性值为图片的地址
 - img 图片地址没有限定在本系统内,可以是用户网络能访问到的任意图片
 - img 图片可上传图片到 img/papers 目录下, img/papers 下的目录可按科目划分.
 - img 标签只能出现在题号和选项序号的后面

img 标签示例:
```html
<img src="./img/papers/科目1/emoticon-tongue-outline.png"/>
```

在题目和选项中显示图片的示例:
```html
2.<img src="./img/papers/科目1/emoticon-tongue-outline.png"/>依据《中国南方电网有限责任公司电力安全工作规程》，作<img src="./img/papers/科目/emoticon-tongue-outline.png"/>业人员应在（）的保护范围内作业。
A.接地线    
B.隔离栏    
C.<img src="./img/papers/科目1/emoticon-tongue-outline.png"/>绝缘罩<img src="./img/papers/科目/emoticon-tongue-outline.png"/>
Answer:A
```

错误示例:
```html
2.依据《中国南方电网有限责任公司电力安全工作规程》，作业人员应在（）的保护范围内作业。
A.接地线    
<img src="./img/papers/科目1/emoticon-tongue-outline.png"/>B.隔离栏    
C.绝缘罩    
Answer:A
```
错误说明: img 标签放在选项B的前面, 导致程序解析 txt 题库异常