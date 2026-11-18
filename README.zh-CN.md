# Paperplane

[English](README.md) | **简体中文**

让 Slack 网页版更清爽：Telegram 风格的消息气泡、更简洁的侧边栏，以及支持一层子容器的个人分组。

**发布者：** Thin-K-ayn · **版本：** 0.5.0 beta

[隐私政策（英文）](https://thin-k-ayn.github.io/paperplane/privacy.html) · [联系支持](mailto:windlyen@gmail.com)

## 安装 Paperplane（免费，约 2 分钟）

Paperplane 目前通过本仓库分发，暂缓上架 Chrome 应用商店。无需注册开发者账号、付费、安装 Git 或使用构建工具。

请在**电脑上的 Google Chrome 浏览器**中使用 Slack。Paperplane 不适用于 Slack 桌面客户端或手机应用。

1. [下载最新源码 ZIP](https://github.com/Thin-K-ayn/paperplane/archive/refs/heads/main.zip)，或在本仓库页面点击 **Code → Download ZIP**。
2. 将 ZIP 解压到一个长期保留的位置，例如 `Documents/Paperplane`。安装后不要删除或移动该文件夹，Chrome 会直接读取其中的文件。
3. 在**平时使用 Slack 的同一个 Chrome 用户配置中**，在地址栏输入 `chrome://extensions` 并按回车。
4. 打开右上角的**开发者模式（Developer mode）**，使用 Paperplane 期间请保持开启。
5. 点击**加载已解压的扩展程序（Load unpacked）**。在解压后的 `paperplane-main` 文件夹中，选择 **`extension`** 文件夹。该文件夹内应包含 `manifest.json`；不要选择 ZIP 文件或外层仓库文件夹。
6. 确认扩展列表中出现 **Paperplane — Chat layout for Slack**，且开关已开启。
7. 在 Chrome 中打开 Slack 工作区，或刷新所有已打开的 Slack 标签页，即可看到新布局。随时可选择 **Original Slack** 切回原始布局。

开始整理时，点击侧边栏上方的 **Containers → + New**。每位同事需要创建自己的容器；下载本仓库不会复制其他人的 Slack 聊天内容或分组设置。

## 更新已安装的版本

目前需要**手动更新**。只下载新的 ZIP 文件，不会更新已安装的扩展。

1. 使用上方链接下载最新源码 ZIP，并解压到一个临时文件夹。
2. 找到**最初加载到 Chrome 的那个 `extension` 文件夹**。如果不确定，可打开 `chrome://extensions`，点击 Paperplane 的**详细信息（Details）**，查看已解压扩展的源路径。
3. 将**新版 `extension` 文件夹内的全部内容**复制到原来的 `extension` 文件夹中。遇到提示时，替换同名文件并合并子文件夹。保持原文件夹的名称和位置不变，注意不要误放成 `extension/extension`。
4. 打开 `chrome://extensions`，点击现有 Paperplane 卡片上的圆形**重新加载（Reload）**按钮。
5. 刷新所有已打开的 Slack 标签页。对照本说明顶部的版本号，检查 Paperplane 卡片或详细信息页面中的版本是否已更新。

**保留现有容器：**请在同一个 Chrome 用户配置中，直接更新原位置的扩展。不要点击**移除（Remove）**、清除扩展存储，或从新下载的文件夹再加载一份副本。原地更新并重新加载会保留本地设置；卸载会删除这些设置。设置不保存在下载的源码文件中，当前版本尚无导出或导入功能。

## 常见问题

| 问题 | 处理方法 |
| --- | --- |
| 提示“清单文件缺失或不可读取”（Manifest file is missing or unreadable） | 先解压 ZIP，再选择内层包含 `manifest.json` 的 `extension` 文件夹。 |
| Slack 界面没有变化 | 确认 Paperplane 已在使用 Slack 的同一个 Chrome 用户配置中启用，然后刷新 Slack。如果当前选择的是 Original Slack，请在扩展弹窗中切换到 **Telegram style**。 |
| 更新后没有生效 | 确认替换的是原加载路径中的文件，先在 `chrome://extensions` 中重新加载 Paperplane，再刷新 Slack。两个步骤都需要完成。 |
| 开发者模式或“加载已解压的扩展程序”被禁用 | 联系公司的 IT 管理员，确认是否允许手动安装扩展。 |
| 布局或功能出现异常 | 先切换到 **Original Slack**。提交[问题反馈](https://github.com/Thin-K-ayn/paperplane/issues)时，请提供 Paperplane 版本和复现步骤，并移除截图中的工作区隐私信息。 |

如果只想暂时停用并保留容器，请选择 **Original Slack**，或在 `chrome://extensions` 中关闭 Paperplane 卡片上的开关。保留原安装文件夹即可。

## 功能

- 圆角消息气泡；能从页面显示的个人资料识别账号时，自动将自己的消息右对齐。无法识别时可使用 **Set my messages** 手动设置。
- **Telegram style / Original Slack** 布局切换，扩展弹窗中也可操作。
- 容器及一层子容器，支持自动标题字号、自定义图标和文字颜色。
- 本地置顶、重命名、移动和移除。移除快捷项不会退出或删除 Slack 频道。
- 未读气泡统计有未读内容的聊天数量，而非消息条数。已静音的聊天不计入统计，并在相同置顶分组内排到未静音聊天之后。

在侧边栏上方选择 **Containers**，再点击 **+ New** 创建容器。通过 **+** 添加聊天，通过 **…** 管理项目。容器可以复制 Slack 原生分区中当前已显示的会话，但不会自动同步全团队的分组。

## 隐私与存储

Paperplane 没有后端、分析统计或遥测服务。它使用 Slack 页面中已显示的元数据，以及 Chrome 扩展的本地存储。它不会存储消息正文、读取 Slack 令牌或调用 Slack API。有关本地数据处理、权限、保留期限和支持方式，请阅读[隐私政策（英文）](docs/privacy.html)。

设置按 Chrome 用户配置和 Slack 工作区保存在本地，不会同步给同事或其他设备。关闭扩展会保留设置；卸载会删除扩展存储。

**已使用手动安装版本的用户：**如果将来改用 Chrome 应用商店版本，该版本会拥有不同的扩展 ID 和独立存储。在迁移或重新创建容器之前，请保留手动安装的扩展，但不要同时启用两个版本。当前版本不支持导入、导出或自动迁移。

## 开发与检查

运行扩展不需要安装依赖或执行构建。

```sh
node --test tests/package.test.cjs tests/containers.test.cjs
python -m http.server 8766 --bind 127.0.0.1
```

打开 `http://127.0.0.1:8766/preview/tests.html`，点击 **Run checks**，即可运行真实 DOM 回归检查。预览使用虚构会话和本地存储适配器，不会发送 Slack 消息。`preview/index.html?store-demo` 用于展示商店截图所用的演示界面。

运行 `python scripts/package.py` 可打包发布版本。只有明确列入清单的运行时文件才会进入上传用的 ZIP。发布步骤与商店文案见 [store/RELEASE.md](store/RELEASE.md)（英文）。

## 已知限制

Slack 可能随时更改页面结构。遇到无法识别的结构时，扩展会保留原有行为。连续消息如果暂时无法识别发送者，可能会先显示在左侧，直到相关元数据可用。未读和静音状态来自已显示的侧边栏项目；尚未显示的项目发生变化时，需要等待 Slack 再次渲染后才能识别。在多个标签页同时编辑分组时，以最后保存的版本为准。

0.4.5 中的自动对齐改动已通过模拟浏览器检查，但尚未在重新加载后观察一次真实的新消息发送。文件上传、所有工作区变体及完整的长历史记录场景尚未全部测试。如果出现裁切或异常行为，请切换到 **Original Slack**。

本项目独立开发，与 Slack 或 Telegram 无隶属或背书关系。产品名称归其各自所有者所有。
