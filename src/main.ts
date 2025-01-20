import { app, BrowserWindow, globalShortcut, clipboard, Notification, dialog, nativeImage, Tray, Menu } from 'electron';
import path from 'path';
import started from 'electron-squirrel-startup';
import dotenv from 'dotenv';
import OpenAI from "openai";
import { systemPrompt } from './prompt';

dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

let tray: Tray; // トレイをグローバルに保持

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
  }

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
};

const createTray = () => {
  // テンプレートを作った時の画像を16pxに加工
  const trayIcon = nativeImage.createFromPath("icon.png").resize({ width: 16 });
  // Tray作成
  tray = new Tray(trayIcon);
  // Trayにメニュー追加
  const contextMenu = Menu.buildFromTemplate([
    // TODO: ユーザーが期待する出力を伝えられるようにする。
    {
      label: "出力例をAIに伝える",
      click: () => {
        createWindow();
      },
    },
    // TODO: モデル選択のメニューを追加
    {
      label: "モデルを選択する",
      click: () => {
        createWindow();
      },
    },
    {
      label: "終了する",
      click: () => {
        app.quit();
      },
    },
  ]);
  tray.setContextMenu(contextMenu);
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  // createWindow();
  createTray();

  const isRegistered = globalShortcut.register('CommandOrControl+P', async () => {
    console.log('Command+P pressed');
    const selectedText = await getSelectedText();
    const transformedText = await transformText(selectedText);
    console.log('selectedText:', selectedText.replace(/\n/g, ' ').slice(0, 100));
    console.log('transformedText:', transformedText.replace(/\n/g, ' ').slice(0, 100));
    replaceSelectedText(transformedText);
    console.log('');
  });

  if (!isRegistered) {
    console.log('Command+P registration failed');
  } else {
    console.log('Command+P registered successfully');
  }
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

// アプリ終了時にショートカットを解除
app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

// 選択テキストの取得
async function getSelectedText(): Promise<string> {
  try {
    // クリップボードの内容を取得
    const text = clipboard.readText();
    return text;
  } catch (error) {
    console.error('Error in getSelectedText:', error);
    return ""; // エラー時は空の文字列を返す
  }
}

// テキストの書き戻し
function replaceSelectedText(newText: string) {
  clipboard.writeText(newText);
  flashTrayIcon();
}

function flashTrayIcon() {
  const originalIcon = nativeImage.createFromPath("icon.png").resize({ width: 16 });
  const pinkIcon = nativeImage.createFromPath("icon-pink.png").resize({ width: 16 });

  tray.setImage(pinkIcon);
  setTimeout(() => {
    tray.setImage(originalIcon);
  }, 500); // 0.5秒後に元のアイコンに戻す
}

// テキスト変換
async function transformText(text: string): Promise<string> {
  try {
    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: text,
        },
      ],
      model: "gpt-4o",
    });
    const data = completion.choices[0].message.content;

    return data;
  } catch (error) {
    console.error('Error transforming text:', error);
    return text; // エラー時は元のテキストを返す
  }
}

function sendGlobalNotification(message: string, duration: number = 5000) {
  const notification = new Notification({ title: '通知', body: message });
  notification.show();

  // durationミリ秒後に通知を消す
  setTimeout(() => {
    notification.close();
  }, duration);
}

function setReminder(message: string, delay: number) {
  setTimeout(() => {
    sendGlobalNotification(message);
  }, delay);
}

// 使用例
setReminder('リマインダー: ミーティングの時間です！', 3600000); // 1時間後に通知
