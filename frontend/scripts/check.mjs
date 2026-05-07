import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const app = readFileSync(resolve(root, 'src/main.jsx'), 'utf8');
const css = readFileSync(resolve(root, 'src/styles/app.css'), 'utf8');
const store = readFileSync(resolve(root, 'src/store/useWorkspaceStore.js'), 'utf8');
const packageJson = readFileSync(resolve(root, 'package.json'), 'utf8');
const source = `${app}\n${css}\n${store}\n${packageJson}`;

const requiredTokens = [
  'REQ-FOLDER-001',
  'REQ-FOLDER-002',
  'REQ-FOLDER-SEC-001',
  'REQ-SHARE-001',
  'REQ-AUDIO-001',
  'REQ-MEETING-001',
  'REQ-WEEKLY-001',
  'REQ-DEADLINE-001',
  'REQ-TIME-001',
  'https://developers.openai.com/api/docs/guides/code-generation#next-steps',
  'BorderGlow',
  'Folder',
  'CardSwap',
  'Stepper',
  '오늘 할 일',
  '회사 일정',
  '대기 수',
  'AI 워커에 맡기기',
  '회의록 녹음본',
  'floating-chat-button',
  'Pretendard',
  'CreateFolderModal',
  'folderCreateType',
  'forceOpen',
  'StatusBadge',
  'tree-badge',
  'chat-room',
  'chat-message mine',
  'deleteFile',
  'deleteFolder',
  '삭제 비밀번호',
  '열람권 또는',
  'tree-delete-button',
  'file-action-button',
  '회사 도우미',
  '회사도우미 메인으로 이동',
  '업무 산출물 허브',
  '파일 목록',
  '조회',
  '수정 저장',
  'writeAccessCookie',
  'ACCESS_COOKIE_TTL_MS',
  '열람권',
  '분 남음',
  'deleteAccessCookie',
  'revokeFolderAccess',
  'access-delete-button',
  'folderSearchQuery',
  '새로 생성',
  'search-create-row',
  'lockFolderId',
  '관리자 이메일',
  '비밀번호 찾기',
  '사용자 추가',
  '공유 세션 쿠키'
];

const missing = requiredTokens.filter((token) => !source.includes(token));

if (missing.length > 0) {
  console.error(`Missing implementation tokens: ${missing.join(', ')}`);
  process.exit(1);
}

if (source.includes('@media')) {
  console.error('Media queries should not be used in the web-only prototype.');
  process.exit(1);
}

const removedUiTokens = [
  'OpenAI developer docs inspired layout',
  '폴더 기반 업무 산출물 허브',
  'Frontend prototype',
  'className="topbar"',
  'className="tabbar"'
];

const leftovers = removedUiTokens.filter((token) => app.includes(token));
if (leftovers.length > 0) {
  console.error(`Removed header/tab UI tokens still exist: ${leftovers.join(', ')}`);
  process.exit(1);
}

if (app.includes('요구사항 연결')) {
  console.error('Requirements connection section should not be rendered on the dashboard.');
  process.exit(1);
}

if (app.includes('AI 산출물')) {
  console.error('Metric label should be 대기 수, not AI 산출물.');
  process.exit(1);
}

if (app.includes("{ label: 'AI 워커'")) {
  console.error('Metric label should be 대기 수, not AI 워커.');
  process.exit(1);
}

if (app.includes('className="panel ai-worker-panel"')) {
  console.error('Meeting AI worker should live in the file creation area, not as a dashboard panel.');
  process.exit(1);
}

if (!store.includes("from 'zustand'") || !packageJson.includes('"zustand"')) {
  console.error('Missing zustand store integration.');
  process.exit(1);
}

if (!app.includes('JSON.parse') || !app.includes('markdownToHtml') || !app.includes('uploadedAudioName')) {
  console.error('Missing file validation, Markdown preview, or shared audio pipeline behavior.');
  process.exit(1);
}

console.log('Frontend implementation checklist passed.');
