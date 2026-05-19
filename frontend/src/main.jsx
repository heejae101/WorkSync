import React, { useEffect, useMemo, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import BorderGlow from './components/BorderGlow';
import CardSwap, { Card } from './components/CardSwap';
import Folder from './components/Folder';
import Stepper, { Step } from './components/Stepper';
import { useWorkspaceStore } from './store/useWorkspaceStore';
import './styles/app.css';
import EditorPage from "./tiptapEx/EditorPage";

const requirements = [
  'REQ-FOLDER-001',
  'REQ-FOLDER-002',
  'REQ-FOLDER-SEC-001',
  'REQ-SHARE-001',
  'REQ-AUDIO-001',
  'REQ-MEETING-001',
  'REQ-WEEKLY-001',
  'REQ-DEADLINE-001',
  'REQ-TIME-001'
];

const filePresets = {
  md: { label: '메모', fileName: '새_문서.md', content: '# 새 문서\n\n- 할 일을 작성하세요.' },
  meeting: { label: '회의록', fileName: '회의록.md', content: '# 회의록\n\n## 참석자\n\n## 논의 내용\n\n## 액션 아이템\n- ' },
  report: { label: '주간보고', fileName: '주간보고.md', content: '# 주간 보고\n\n## 이번 주 진행\n\n## 이슈\n\n## 다음 주 계획\n' },
  deadline: { label: '마감일', fileName: '마감일.json', content: '{\n  "title": "마감일 후보",\n  "dueDate": "2026-05-10",\n  "status": "candidate"\n}' },
  html: { label: 'HTML', fileName: '새_페이지.html', content: '<h2>새 페이지</h2><p>내용을 작성하세요.</p>' },
  json: { label: 'JSON', fileName: 'data.json', content: '{\n  "status": "draft"\n}' }
};

const ACCESS_COOKIE_TTL_MS = 30 * 60 * 1000;

function getAccessCookieName(folder) {
  return `company_helper_access_${encodeURIComponent(folder.type)}_${encodeURIComponent(folder.name)}`;
}

function writeAccessCookie(folder) {
  const expiresAt = Date.now() + ACCESS_COOKIE_TTL_MS;
  const value = encodeURIComponent(JSON.stringify({ folderId: folder.id, type: folder.type, name: folder.name, expiresAt }));
  document.cookie = `${getAccessCookieName(folder)}=${value}; max-age=${ACCESS_COOKIE_TTL_MS / 1000}; path=/; SameSite=Lax`;
  return expiresAt;
}

function deleteAccessCookie(folder) {
  document.cookie = `${getAccessCookieName(folder)}=; max-age=0; path=/; SameSite=Lax`;
  document.cookie = `${getAccessCookieName(folder)}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax`;
}

function readCookie(name) {
  const encodedName = `${name}=`;
  return document.cookie
    .split('; ')
    .find((cookie) => cookie.startsWith(encodedName))
    ?.slice(encodedName.length);
}

function readAccessGrants(folders) {
  const now = Date.now();
  return folders.reduce((grants, folder) => {
    const rawValue = readCookie(getAccessCookieName(folder));
    if (!rawValue) return grants;
    try {
      const grant = JSON.parse(decodeURIComponent(rawValue));
      if (grant.expiresAt > now) {
        grants[folder.id] = grant;
      }
    } catch (error) {
      return grants;
    }
    return grants;
  }, {});
}

function getGrantMinutesLeft(grant) {
  if (!grant) return 0;
  return Math.max(0, Math.ceil((grant.expiresAt - Date.now()) / 60000));
}

function getFileExtension(fileName) {
  return fileName.split('.').pop()?.toLowerCase() ?? '';
}

function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function markdownToHtml(markdown) {
  const lines = markdown.split('\n');
  const html = [];
  let inList = false;

  lines.forEach((line) => {
    if (line.startsWith('# ')) {
      if (inList) {
        html.push('</ul>');
        inList = false;
      }
      html.push(`<h1>${escapeHtml(line.slice(2))}</h1>`);
      return;
    }
    if (line.startsWith('## ')) {
      if (inList) {
        html.push('</ul>');
        inList = false;
      }
      html.push(`<h2>${escapeHtml(line.slice(3))}</h2>`);
      return;
    }
    if (line.startsWith('- ')) {
      if (!inList) {
        html.push('<ul>');
        inList = true;
      }
      html.push(`<li>${escapeHtml(line.slice(2))}</li>`);
      return;
    }
    if (inList) {
      html.push('</ul>');
      inList = false;
    }
    if (line.trim()) {
      html.push(`<p>${escapeHtml(line)}</p>`);
    }
  });

  if (inList) html.push('</ul>');
  return html.join('');
}

function validateFileContent(file) {
  if (!['md', 'html', 'json'].includes(file.type)) {
    return { ok: false, message: '지원하지 않는 파일 형식입니다. md, html, json만 저장할 수 있습니다.' };
  }
  if (file.type === 'json') {
    try {
      JSON.parse(file.content);
    } catch (error) {
      return { ok: false, message: '유효하지 않은 JSON입니다. 저장 전에 문법을 수정하세요.' };
    }
  }
  return { ok: true, message: '' };
}

function buildPreview(file) {
  if (!file) return { kind: 'empty', content: '' };
  if (file.type === 'md') return { kind: 'html', content: markdownToHtml(file.content) };
  if (file.type === 'html') return { kind: 'html', content: file.content };
  if (file.type === 'json') {
    try {
      return { kind: 'code', content: JSON.stringify(JSON.parse(file.content), null, 2) };
    } catch (error) {
      return { kind: 'error', content: 'JSON 미리보기를 표시할 수 없습니다. 문법 오류를 먼저 수정하세요.' };
    }
  }
  return { kind: 'error', content: '지원하지 않는 파일 형식입니다.' };
}

function App() {
    return <EditorPage />;
  const {
    activeTab,
    folders,
    selectedFolderId,
    selectedFileId,
    unlockedFolderIds,
    accessGrants,
    folderName,
    folderSearchQuery,
    folderCreateOpen,
    folderCreateType,
    folderCreatePassword,
    folderCreateEmail,
    folderCreateAlias,
    newFileName,
    newFileType,
    lockPassword,
    lockError,
    shareForm,
    shareJoined,
    sharedChatOpen,
    shareError,
    shareMessageDraft,
    sharedMessages,
    transcript,
    meetingReady,
    reportReady,
    deadlineReady,
    timeReady,
    meetingJobState,
    reportJobState,
    deadlineJobState,
    timeJobState,
    uploadError,
    uploadedAudioName,
    fileSaveState,
    fileError,
    fileCreationError,
    selectedDeadlineIndex,
    setField,
    setShareForm,
    setFolders,
    setAccessGrants,
    unlockFolderId,
    lockFolderId
  } = useWorkspaceStore();

  const setActiveTab = (value) => setField('activeTab', value);
  const setSelectedFolderId = (value) => setField('selectedFolderId', value);
  const setSelectedFileId = (value) => setField('selectedFileId', value);
  const setFolderName = (value) => setField('folderName', value);
  const setFolderSearchQuery = (value) => setField('folderSearchQuery', value);
  const setFolderCreateOpen = (value) => setField('folderCreateOpen', value);
  const setFolderCreateType = (value) => setField('folderCreateType', value);
  const setFolderCreatePassword = (value) => setField('folderCreatePassword', value);
  const setFolderCreateEmail = (value) => setField('folderCreateEmail', value);
  const setFolderCreateAlias = (value) => setField('folderCreateAlias', value);
  const setNewFileName = (value) => setField('newFileName', value);
  const setNewFileType = (value) => setField('newFileType', value);
  const setLockPassword = (value) => setField('lockPassword', value);
  const setLockError = (value) => setField('lockError', value);
  const setShareJoined = (value) => setField('shareJoined', value);
  const setSharedChatOpen = (value) => setField('sharedChatOpen', value);
  const setShareError = (value) => setField('shareError', value);
  const setShareMessageDraft = (value) => setField('shareMessageDraft', value);
  const setSharedMessages = (value) => setField('sharedMessages', value);
  const setTranscript = (value) => setField('transcript', value);
  const setMeetingReady = (value) => setField('meetingReady', value);
  const setReportReady = (value) => setField('reportReady', value);
  const setDeadlineReady = (value) => setField('deadlineReady', value);
  const setTimeReady = (value) => setField('timeReady', value);
  const setMeetingJobState = (value) => setField('meetingJobState', value);
  const setReportJobState = (value) => setField('reportJobState', value);
  const setDeadlineJobState = (value) => setField('deadlineJobState', value);
  const setTimeJobState = (value) => setField('timeJobState', value);
  const setUploadError = (value) => setField('uploadError', value);
  const setUploadedAudioName = (value) => setField('uploadedAudioName', value);
  const setFileSaveState = (value) => setField('fileSaveState', value);
  const setFileError = (value) => setField('fileError', value);
  const setFileCreationError = (value) => setField('fileCreationError', value);
  const setSelectedDeadlineIndex = (value) => setField('selectedDeadlineIndex', value);

  const selectedFolder = folders.find((folder) => folder.id === selectedFolderId) ?? folders[0];
  const selectedFile = selectedFolder?.files.find((file) => file.id === selectedFileId) ?? selectedFolder?.files[0];
  const hasSelectedFolderAccess = Boolean(accessGrants[selectedFolder?.id]) || unlockedFolderIds.includes(selectedFolder?.id);
  const folderLocked = selectedFolder?.locked && !hasSelectedFolderAccess;
  const visibleFolders = folders.filter((folder) => folder.name.toLowerCase().includes(folderSearchQuery.trim().toLowerCase()));

  useEffect(() => {
    const restoreAccessGrants = () => {
      const grants = readAccessGrants(folders);
      setAccessGrants(grants);
      Object.values(grants).forEach((grant) => {
        if (grant.type === 'personal') {
          unlockFolderId(grant.folderId);
        }
        if (grant.type === 'shared') {
          setShareJoined(true);
          setShareForm({ room: grant.name.replace('공유 세션: ', '') });
        }
      });
    };

    restoreAccessGrants();
    const timerId = window.setInterval(restoreAccessGrants, 30000);
    return () => window.clearInterval(timerId);
  }, [folders, setAccessGrants, unlockFolderId]);

  const metrics = useMemo(() => {
    const fileCount = folders.reduce((sum, folder) => sum + folder.files.length, 0);
    return [
      { label: '폴더', value: folders.length },
      { label: '파일', value: fileCount },
      { label: '임박 마감', value: deadlineReady ? 3 : 2 },
      { label: '대기 수', value: [meetingJobState, reportJobState, deadlineJobState, timeJobState].filter((state) => state === 'running').length }
    ];
  }, [folders, deadlineReady, meetingJobState, reportJobState, deadlineJobState, timeJobState]);

  const addFolder = (type = folderCreateType) => {
    const name = folderName.trim();
    if (!name) return;
    const adminName = folderCreateAlias.trim() || '관리자';
    const adminEmail = folderCreateEmail.trim().toLowerCase();
    const adminPassword = folderCreatePassword.trim();
    if (type === 'shared' && (!adminEmail || !adminPassword)) return;

    const folder = {
      id: `folder-${Date.now()}`,
      name,
      type,
      locked: Boolean(folderCreatePassword.trim()) || type === 'shared',
      password: type === 'personal' ? folderCreatePassword.trim() : '',
      passwordHint: type === 'shared' ? '등록된 이메일과 비밀번호로 입장하세요.' : folderCreatePassword.trim() ? '사용자가 만든 접근 키가 필요합니다.' : '',
      users:
        type === 'shared'
          ? [
              {
                id: `user-${Date.now()}`,
                name: adminName,
                email: adminEmail,
                password: adminPassword,
                role: 'admin',
                verificationCode: '123456'
              }
            ]
          : undefined,
      files: []
    };
    setFolders((current) => [...current, folder]);
    setSelectedFolderId(folder.id);
    setFolderName('');
    setFolderCreatePassword('');
    setFolderCreateEmail('');
    setFolderCreateAlias('');
    setFolderCreateOpen(false);
    if (type === 'shared') {
            setShareForm({ alias: adminName, email: adminEmail, password: '', role: 'admin', room: name.replace('공유 세션: ', '') });
            grantFolderAccess(folder);
    }
    setActiveTab('workspace');
  };

  const grantFolderAccess = (folder) => {
    const expiresAt = writeAccessCookie(folder);
    setAccessGrants({
      ...readAccessGrants(folders),
      [folder.id]: { folderId: folder.id, type: folder.type, name: folder.name, expiresAt }
    });
    if (folder.type === 'personal') {
      unlockFolderId(folder.id);
    }
    if (folder.type === 'shared') {
      setShareJoined(true);
      setSharedChatOpen(true);
    }
  };

  const revokeFolderAccess = (folder) => {
    deleteAccessCookie(folder);
    const nextGrants = { ...accessGrants };
    delete nextGrants[folder.id];
    setAccessGrants(nextGrants);
    if (folder.type === 'personal') {
      lockFolderId(folder.id);
    }
    if (folder.type === 'shared') {
      setShareJoined(false);
      setSharedChatOpen(false);
      setShareError('');
    }
  };

  const deleteFolder = (folderId) => {
    const folderToDelete = folders.find((folder) => folder.id === folderId);
    if (!folderToDelete) return;
    const hasDeleteAccess = Boolean(accessGrants[folderId]) || unlockedFolderIds.includes(folderId) || !folderToDelete.locked;
    if (!hasDeleteAccess) {
      const password = window.prompt(`${folderToDelete.name} 삭제 비밀번호를 입력하세요.`);
      if (password === null) return;
      const validPassword =
        folderToDelete.type === 'shared'
          ? folderToDelete.users?.some((user) => user.password === password)
          : folderToDelete.password === password;
      if (!validPassword) {
        if (folderToDelete.type === 'shared') {
          setShareError('삭제 비밀번호가 맞지 않습니다. 열람권 또는 등록 사용자 비밀번호가 필요합니다.');
        } else {
          setLockError('삭제 비밀번호가 맞지 않습니다. 열람권 또는 폴더 비밀번호가 필요합니다.');
        }
        return;
      }
    }
    deleteAccessCookie(folderToDelete);
    const nextFolders = folders.filter((folder) => folder.id !== folderId);
    const nextGrants = { ...accessGrants };
    delete nextGrants[folderId];
    setAccessGrants(nextGrants);
    setFolders(nextFolders);
    if (selectedFolderId === folderId) {
      const nextFolder = nextFolders[0];
      setSelectedFolderId(nextFolder?.id ?? '');
      setSelectedFileId(nextFolder?.files[0]?.id ?? '');
      setFileSaveState('saved');
      setFileError('');
      setLockPassword('');
      setLockError('');
      if (folderToDelete.type === 'shared') {
        setShareJoined(false);
        setSharedChatOpen(false);
        setShareError('');
      }
    }
  };

  const addFile = () => {
    if (!selectedFolder || folderLocked) return;
    const preset = filePresets[newFileType] ?? filePresets.md;
    const fileName = newFileName.trim() || preset.fileName;
    const extension = getFileExtension(fileName);
    if (!['md', 'html', 'json'].includes(extension)) {
      setFileCreationError('md, html, json 파일만 생성할 수 있습니다.');
      return;
    }
    const file = {
      id: `file-${Date.now()}`,
      name: fileName,
      type: extension,
      content: preset.content
    };
    setFolders((current) =>
      current.map((folder) => (folder.id === selectedFolder.id ? { ...folder, files: [...folder.files, file] } : folder))
    );
    setSelectedFileId(file.id);
    setFileSaveState('saved');
    setFileCreationError('');
    setFileError('');
    setActiveTab('workspace');
  };

  const updateFileContent = (content) => {
    if (!selectedFolder || !selectedFile) return;
    setFileSaveState('unsaved');
    setFileError('');
    setFolders((current) =>
      current.map((folder) =>
        folder.id === selectedFolder.id
          ? { ...folder, files: folder.files.map((file) => (file.id === selectedFile.id ? { ...file, content } : file)) }
          : folder
      )
    );
  };

  const deleteFile = (fileId) => {
    if (!selectedFolder || folderLocked) return;
    const remainingFiles = selectedFolder.files.filter((file) => file.id !== fileId);
    setFolders((current) =>
      current.map((folder) => (folder.id === selectedFolder.id ? { ...folder, files: remainingFiles } : folder))
    );
    if (selectedFileId === fileId) {
      setSelectedFileId(remainingFiles[0]?.id ?? '');
      setFileSaveState('saved');
      setFileError('');
      if (remainingFiles.length === 0) {
        setActiveTab('workspace');
      }
    }
  };

  const saveFile = () => {
    if (!selectedFile || folderLocked) return;
    const validation = validateFileContent(selectedFile);
    if (!validation.ok) {
      setFileError(validation.message);
      return;
    }
    setFileError('');
    setFileSaveState('saved');
  };

  const handleMeetingAudioUpload = (file) => {
    const result = validateAudioFile(file);
    if (!result.ok) {
      setUploadError(result.message);
      setUploadedAudioName('');
      setMeetingReady(false);
      setMeetingJobState('idle');
      return;
    }
    setUploadError('');
    setUploadedAudioName(file.name);
    setMeetingReady(false);
    setMeetingJobState('idle');
  };

  const runMeetingWorker = () => {
    if (!selectedFolder || folderLocked) {
      setUploadError('회의록 파일을 만들 수 있는 폴더를 먼저 열어야 합니다.');
      return;
    }
    if (!uploadedAudioName) {
      setUploadError('AI 워커에 맡기려면 먼저 mp3, wav, m4a 녹음본을 올리세요.');
      return;
    }
    setUploadError('');
    setMeetingReady(false);
    setMeetingJobState('running');
    window.setTimeout(() => {
      const generatedTranscript = `${uploadedAudioName} 녹음본에서 추출한 회의 내용입니다. 5월 10일까지 화면 프로토타입을 검토하고, 5월 12일까지 API 계약을 확정합니다.`;
      const meetingFile = {
        id: `file-meeting-${Date.now()}`,
        name: 'AI_회의록.md',
        type: 'md',
        content: `# AI 회의록\n\n## 원문\n${generatedTranscript}\n\n## 요약\n- 화면 프로토타입 검토\n- API 계약 확정\n- 다음 액션 담당자 확인`
      };
      setFolders((current) =>
        current.map((folder) => (folder.id === selectedFolder.id ? { ...folder, files: [...folder.files, meetingFile] } : folder))
      );
      setSelectedFileId(meetingFile.id);
      setTranscript(generatedTranscript);
      setMeetingReady(true);
      setMeetingJobState('succeeded');
      setFileSaveState('saved');
      setActiveTab('workspace');
    }, 650);
  };

  const unlockFolder = () => {
    if (!selectedFolder) return;
    if (lockPassword === selectedFolder.password) {
      grantFolderAccess(selectedFolder);
      setLockPassword('');
      setLockError('');
      return;
    }
    setLockError('비밀번호가 맞지 않습니다. 데모 데이터의 검증 실패 상태입니다.');
  };

  const addSharedUser = (folder) => {
    const name = shareForm.inviteName.trim();
    const email = shareForm.inviteEmail.trim().toLowerCase();
    const password = shareForm.invitePassword.trim();
    if (!name || !email || !password) {
      setShareError('추가할 사용자 이름, 이메일, 비밀번호를 모두 입력하세요.');
      return;
    }
    if (folder.users?.some((user) => user.email.toLowerCase() === email)) {
      setShareError('이미 등록된 이메일입니다.');
      return;
    }
    setFolders((current) =>
      current.map((item) =>
        item.id === folder.id
          ? {
              ...item,
              users: [...(item.users ?? []), { id: `user-${Date.now()}`, name, email, password, role: 'member', verificationCode: '123456' }]
            }
          : item
      )
    );
    setShareError('');
    setShareForm({ inviteName: '', inviteEmail: '', invitePassword: '' });
  };

  const requestSharedResetCode = (folder) => {
    const email = shareForm.resetEmail.trim().toLowerCase();
    const user = folder.users?.find((item) => item.email.toLowerCase() === email);
    if (!user) {
      setShareError('등록된 이메일을 찾을 수 없습니다.');
      return;
    }
    setShareError('');
    setShareForm({ resetNotice: `${email}로 인증번호를 발송했습니다. 데모 인증번호는 ${user.verificationCode}입니다.` });
  };

  const resetSharedPassword = (folder) => {
    const email = shareForm.resetEmail.trim().toLowerCase();
    const code = shareForm.resetCode.trim();
    const nextPassword = shareForm.resetNewPassword.trim();
    const user = folder.users?.find((item) => item.email.toLowerCase() === email);
    if (!user || user.verificationCode !== code || !nextPassword) {
      setShareError('이메일, 인증번호, 새 비밀번호를 확인하세요.');
      return;
    }
    setFolders((current) =>
      current.map((item) =>
        item.id === folder.id
          ? { ...item, users: item.users.map((member) => (member.email.toLowerCase() === email ? { ...member, password: nextPassword } : member)) }
          : item
      )
    );
    setShareError('');
    setShareForm({ password: nextPassword, resetCode: '', resetNewPassword: '', resetNotice: '비밀번호를 변경했습니다. 새 비밀번호로 입장하세요.' });
  };

  const changeSharedPassword = (folder) => {
    const email = shareForm.email.trim().toLowerCase();
    const currentPassword = shareForm.currentPassword.trim();
    const nextPassword = shareForm.newPassword.trim();
    const user = folder.users?.find((item) => item.email.toLowerCase() === email);
    if (!user || user.password !== currentPassword || !nextPassword) {
      setShareError('현재 비밀번호와 새 비밀번호를 확인하세요.');
      return;
    }
    setFolders((current) =>
      current.map((item) =>
        item.id === folder.id
          ? { ...item, users: item.users.map((member) => (member.email.toLowerCase() === email ? { ...member, password: nextPassword } : member)) }
          : item
      )
    );
    setShareError('');
    setShareForm({ password: nextPassword, currentPassword: '', newPassword: '' });
  };

  return (
    <main className="app-shell">
      <aside className="sidebar" aria-label="폴더와 메뉴">
        <button type="button" className="brand" aria-label="회사도우미 메인으로 이동" onClick={() => setActiveTab('dashboard')}>
          <span className="brand-mark">ㅎ</span>
          <div>
            <strong>회사도우미</strong>
            <small>업무 산출물 허브</small>
          </div>
        </button>

        <div className="quick-create">
          <label htmlFor="folder-search">폴더 검색</label>
          <div className="search-create-row">
            <input id="folder-search" value={folderSearchQuery} onChange={(event) => setFolderSearchQuery(event.target.value)} placeholder="폴더 검색" />
            <button type="button" onClick={() => setFolderCreateOpen(true)} aria-label="새로 생성">새로 생성</button>
          </div>
        </div>

        <nav className="folder-tree">
          {visibleFolders.map((folder) => (
            <div
              className={folder.id === selectedFolderId ? 'tree-item active' : 'tree-item'}
              key={folder.id}
            >
              <button
                type="button"
                className="tree-main-action"
                onClick={() => {
                  setSelectedFolderId(folder.id);
                  setSelectedFileId(folder.files[0]?.id ?? '');
                  if (folder.type === 'shared') {
                    setShareForm({ room: folder.name.replace('공유 세션: ', '') });
                  }
                  if (folder.type === 'personal' && !folder.locked) {
                    grantFolderAccess(folder);
                  }
                  setActiveTab('workspace');
                }}
              >
                <Folder
                  size={0.34}
                  color={folder.type === 'shared' ? '#2997ff' : '#0066cc'}
                  className="folder-thumb"
                  forceOpen={folder.id === selectedFolderId}
                  items={folder.files.slice(0, 3).map((file) => <span key={file.id}>{file.type}</span>)}
                />
                <StatusBadge locked={folder.locked && !accessGrants[folder.id] && !unlockedFolderIds.includes(folder.id)} type={folder.type} />
                <strong>{folder.name}</strong>
                <small>{folder.files.length} files</small>
              </button>
              <button type="button" className="tree-delete-button" aria-label={`${folder.name} 삭제`} onClick={() => deleteFolder(folder.id)}>
                삭제
              </button>
            </div>
          ))}
          {visibleFolders.length === 0 && <div className="empty-state">검색 결과가 없습니다.</div>}
        </nav>
      </aside>

      {folderCreateOpen && (
        <CreateFolderModal
          folderName={folderName}
          setFolderName={setFolderName}
          folderCreateType={folderCreateType}
          setFolderCreateType={setFolderCreateType}
          folderCreatePassword={folderCreatePassword}
          setFolderCreatePassword={setFolderCreatePassword}
          folderCreateEmail={folderCreateEmail}
          setFolderCreateEmail={setFolderCreateEmail}
          folderCreateAlias={folderCreateAlias}
          setFolderCreateAlias={setFolderCreateAlias}
          addFolder={addFolder}
          closeModal={() => setFolderCreateOpen(false)}
        />
      )}

      <section className="workbench">
        {activeTab === 'dashboard' && (
          <Dashboard
            metrics={metrics}
            folders={folders}
            accessGrants={accessGrants}
            revokeFolderAccess={revokeFolderAccess}
            setActiveTab={setActiveTab}
          />
        )}
        {activeTab === 'workspace' && (
          <FolderPanel
            folder={selectedFolder}
            folderLocked={folderLocked}
            lockPassword={lockPassword}
            setLockPassword={setLockPassword}
            lockError={lockError}
            unlockFolder={unlockFolder}
            selectedFileId={selectedFileId}
            setSelectedFileId={setSelectedFileId}
            setActiveTab={setActiveTab}
            newFileName={newFileName}
            setNewFileName={setNewFileName}
            newFileType={newFileType}
            setNewFileType={setNewFileType}
            filePresets={filePresets}
            addFile={addFile}
            deleteFile={deleteFile}
            selectedFile={selectedFile}
            updateFileContent={updateFileContent}
            saveFile={saveFile}
            fileSaveState={fileSaveState}
            fileError={fileError}
            fileCreationError={fileCreationError}
            uploadedAudioName={uploadedAudioName}
            uploadError={uploadError}
            transcript={transcript}
            meetingReady={meetingReady}
            meetingJobState={meetingJobState}
            handleMeetingAudioUpload={handleMeetingAudioUpload}
            runMeetingWorker={runMeetingWorker}
            shareForm={shareForm}
            setShareForm={setShareForm}
            shareError={shareError}
            setShareError={setShareError}
            grantFolderAccess={grantFolderAccess}
            addSharedUser={addSharedUser}
            requestSharedResetCode={requestSharedResetCode}
            resetSharedPassword={resetSharedPassword}
            changeSharedPassword={changeSharedPassword}
            shareMessageDraft={shareMessageDraft}
            setShareMessageDraft={setShareMessageDraft}
            sharedMessages={sharedMessages}
            setSharedMessages={setSharedMessages}
          />
        )}
      </section>

      <aside className="right-rail" aria-label="검증 기준">
        <section>
          <h2>Next steps</h2>
          <a href="https://developers.openai.com/api/docs/guides/code-generation#next-steps" target="_blank" rel="noreferrer">OpenAI code generation guide</a>
          <a href="#mvp">MVP 화면 검증</a>
          <a href="#state">프론트 상태 모델</a>
        </section>
        <section>
          <h2>수용 기준</h2>
          <ul className="check-list">
            {requirements.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      </aside>
      {shareJoined && (
        <FloatingSharedChat
          open={sharedChatOpen}
          setOpen={setSharedChatOpen}
          roomName={shareForm.room || selectedFolder?.name || '공유 세션'}
          shareForm={shareForm}
          setShareForm={setShareForm}
          shareMessageDraft={shareMessageDraft}
          setShareMessageDraft={setShareMessageDraft}
          sharedMessages={sharedMessages}
          setSharedMessages={setSharedMessages}
        />
      )}
    </main>
  );
}

function Dashboard({
  metrics,
  folders,
  accessGrants,
  revokeFolderAccess,
  setActiveTab
}) {
  return (
    <div className="content-grid">
      <section className="hero-panel">
        <div>
          <p className="eyebrow">MVP workflow</p>
          <h2>회사 도우미</h2>
          <p>백엔드 연결 전에도 화면 흐름과 상태 전이를 검토할 수 있도록 모든 MVP 화면을 프론트 상태로 동작하게 구성했습니다.</p>
          <div className="action-row">
            <button type="button" onClick={() => setActiveTab('workspace')}>폴더 열기</button>
          </div>
        </div>
        <div className="hero-card-stage" aria-hidden="true">
          <CardSwap width={300} height={210} cardDistance={42} verticalDistance={48} delay={3800} pauseOnHover easing="linear" skewAmount={4}>
            <Card customClass="hero-swap-card primary">
              <span>파일 목록</span>
              <strong>회의록.md</strong>
              <p>작성, 조회, 수정, 삭제를 한 화면에서 처리</p>
            </Card>
            <Card customClass="hero-swap-card shared">
              <span>공유 세션</span>
              <strong>제품팀 채팅</strong>
              <p>나는 오른쪽, 상대방은 왼쪽으로 정렬</p>
            </Card>
            <Card customClass="hero-swap-card grant">
              <span>열람권</span>
              <strong>30분 만료</strong>
              <p>개인/공유 키를 쿠키 기준으로 관리</p>
            </Card>
          </CardSwap>
        </div>
      </section>
      <section className="metric-grid" id="mvp">
        {metrics.map((metric) => (
          <BorderGlow key={metric.label} className="metric-card" animated={metric.label === '폴더'}>
            <article className="metric">
              <span>{metric.label}</span>
              <strong>{metric.value}</strong>
            </article>
          </BorderGlow>
        ))}
      </section>
      <section className="panel">
        <h2>최근 세션</h2>
        <div className="list">
          {folders.map((folder) => (
            <BorderGlow key={folder.id} className="item-card" glowRadius={18} borderRadius={18}>
              <div className="list-row">
                <strong>{folder.name}</strong>
                <span>{folder.type === 'shared' ? '공유' : '개인'} · {folder.files.length}개 파일</span>
              </div>
            </BorderGlow>
          ))}
        </div>
      </section>
      <section className="panel access-panel">
        <h2>열람권</h2>
        <div className="access-list">
          {Object.values(accessGrants).map((grant) => {
            const folder = folders.find((item) => item.id === grant.folderId);
            const minutesLeft = getGrantMinutesLeft(grant);
            if (!folder || minutesLeft <= 0) return null;
            return (
              <div className="access-row active" key={grant.folderId}>
                <div>
                  <strong>{grant.name}</strong>
                  <span>{grant.type === 'shared' ? '공유 세션 쿠키' : '개인 세션 쿠키'}</span>
                </div>
                <div className="access-controls">
                  <em>{minutesLeft}분 남음</em>
                  <button type="button" className="access-delete-button" onClick={() => revokeFolderAccess(folder)}>
                    삭제
                  </button>
                </div>
              </div>
            );
          })}
          {Object.values(accessGrants).filter((grant) => getGrantMinutesLeft(grant) > 0).length === 0 && (
            <div className="empty-state">현재 쿠키에 저장된 열람권이 없습니다.</div>
          )}
        </div>
      </section>
      <section className="panel schedule-panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">TODAY</p>
            <h2>오늘 할 일</h2>
          </div>
          <span className="status-pill">회사 일정</span>
        </div>
        <Stepper backButtonText="이전" nextButtonText="다음" onFinalStepCompleted={() => {}}>
          <Step>
            <div className="schedule-step">
              <span>09:30</span>
              <h3>출근 체크와 오늘 업무 정리</h3>
              <p>개인 업무 폴더에서 오늘 처리할 파일을 열고 회의 전 확인할 내용을 정리합니다.</p>
            </div>
          </Step>
          <Step>
            <div className="schedule-step">
              <span>11:00</span>
              <h3>제품팀 공유 세션 회의</h3>
              <p>공유 세션에 입장해 회의록을 작성하고, 참여자별 액션 아이템을 파일 목록에 남깁니다.</p>
            </div>
          </Step>
          <Step>
            <div className="schedule-step">
              <span>16:00</span>
              <h3>주간 보고와 마감일 확인</h3>
              <p>주간보고.md와 마감일.json을 업데이트한 뒤 열람권이 남은 공유 세션을 정리합니다.</p>
            </div>
          </Step>
        </Stepper>
      </section>
    </div>
  );
}

function StatusBadge({ locked, type }) {
  const label = locked ? '잠금' : type === 'shared' ? '공유' : '개인';
  const className = locked ? 'tree-badge locked' : type === 'shared' ? 'tree-badge shared' : 'tree-badge personal';

  return (
    <span className={className}>
      <span className="badge-dot" />
      {label}
    </span>
  );
}

function CreateFolderModal({
  folderName,
  setFolderName,
  folderCreateType,
  setFolderCreateType,
  folderCreatePassword,
  setFolderCreatePassword,
  folderCreateEmail,
  setFolderCreateEmail,
  folderCreateAlias,
  setFolderCreateAlias,
  addFolder,
  closeModal
}) {
  const canCreate =
    folderCreateType === 'shared'
      ? Boolean(folderName.trim() && folderCreateEmail.trim() && folderCreatePassword.trim())
      : Boolean(folderName.trim());

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={closeModal}>
      <section className="create-folder-modal" role="dialog" aria-modal="true" aria-labelledby="create-folder-title" onMouseDown={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <div>
            <p className="eyebrow">Create workspace</p>
            <h2 id="create-folder-title">어떤 공간을 만들까요?</h2>
          </div>
          <button type="button" className="icon-button" aria-label="닫기" onClick={closeModal}>×</button>
        </div>

        <label className="modal-field">
          이름
          <input value={folderName} onChange={(event) => setFolderName(event.target.value)} placeholder="예: 마케팅 주간회의" autoFocus />
        </label>

        <div className="folder-choice-grid" role="radiogroup" aria-label="폴더 유형">
          <button
            type="button"
            className={folderCreateType === 'personal' ? 'folder-choice active' : 'folder-choice'}
            onClick={() => setFolderCreateType('personal')}
            aria-pressed={folderCreateType === 'personal'}
          >
            <Folder size={0.82} color="#0066cc" items={[<span key="note">md</span>, <span key="json">json</span>]} />
            <strong>개인 세션</strong>
            <span>나만 보는 업무 기록과 파일을 정리합니다.</span>
          </button>

          <button
            type="button"
            className={folderCreateType === 'shared' ? 'folder-choice active' : 'folder-choice'}
            onClick={() => setFolderCreateType('shared')}
            aria-pressed={folderCreateType === 'shared'}
          >
            <Folder size={0.82} color="#2997ff" items={[<span key="alias">alias</span>, <span key="html">html</span>]} />
            <strong>공유 세션</strong>
            <span>관리자가 사용자를 추가하고 이메일 계정으로 입장합니다.</span>
          </button>
        </div>

        {folderCreateType === 'personal' && (
          <label className="modal-field">
            개인 비밀번호
            <input type="password" value={folderCreatePassword} onChange={(event) => setFolderCreatePassword(event.target.value)} placeholder="비워두면 잠금 없이 생성" />
          </label>
        )}

        {folderCreateType === 'shared' && (
          <div className="shared-admin-fields">
            <label className="modal-field">
              관리자 이름
              <input value={folderCreateAlias} onChange={(event) => setFolderCreateAlias(event.target.value)} placeholder="예: 민지" />
            </label>
            <label className="modal-field">
              관리자 이메일
              <input type="email" value={folderCreateEmail} onChange={(event) => setFolderCreateEmail(event.target.value)} placeholder="admin@company.com" />
            </label>
            <label className="modal-field">
              관리자 비밀번호
              <input type="password" value={folderCreatePassword} onChange={(event) => setFolderCreatePassword(event.target.value)} placeholder="관리자 입장 비밀번호" />
            </label>
          </div>
        )}

        <div className="modal-actions">
          <button type="button" className="secondary" onClick={closeModal}>취소</button>
          <button type="button" onClick={() => addFolder(folderCreateType)} disabled={!canCreate}>
            {folderCreateType === 'shared' ? '공유 세션 만들기' : '개인 세션 만들기'}
          </button>
        </div>
      </section>
    </div>
  );
}

function FolderPanel(props) {
  const {
    folder,
    folderLocked,
    lockPassword,
    setLockPassword,
    lockError,
    unlockFolder,
    selectedFileId,
    setSelectedFileId,
    newFileName,
    setNewFileName,
    newFileType,
    setNewFileType,
    filePresets,
    addFile,
    deleteFile,
    selectedFile,
    updateFileContent,
    saveFile,
    fileSaveState,
    fileError,
    fileCreationError,
    uploadedAudioName,
    uploadError,
    transcript,
    meetingReady,
    meetingJobState,
    handleMeetingAudioUpload,
    runMeetingWorker,
    shareForm,
    setShareForm,
    shareError,
    setShareError,
    grantFolderAccess,
    addSharedUser,
    requestSharedResetCode,
    resetSharedPassword,
    changeSharedPassword,
    shareMessageDraft,
    setShareMessageDraft,
    sharedMessages,
    setSharedMessages
  } = props;

  if (!folder) return null;

  return (
    <section className="panel wide">
      <div className="section-heading">
        <div>
          <p className="eyebrow">SCR-SESSION-001 / SCR-FOLDER-LOCK-001</p>
          <h2>{folder.name}</h2>
        </div>
        <span className="status-pill">{folderLocked ? '잠금 필요' : '열림'}</span>
      </div>

      {folderLocked ? (
        <div className="lock-box">
          {folder.type === 'shared' ? (
            <>
              <div className="shared-login-grid">
                <label>
                  이메일
                  <input type="email" value={shareForm.email} onChange={(event) => setShareForm({ email: event.target.value })} placeholder="admin@company.test" />
                </label>
                <label>
                  비밀번호
                  <input type="password" value={shareForm.password} onChange={(event) => setShareForm({ password: event.target.value })} placeholder="등록된 비밀번호" />
                </label>
              </div>
              <button
                type="button"
                onClick={() => {
                  const email = shareForm.email.trim().toLowerCase();
                  const user = folder.users?.find((member) => member.email.toLowerCase() === email);
                  if (!user || user.password !== shareForm.password) {
                    setShareError('등록된 이메일 또는 비밀번호가 맞지 않습니다.');
                    return;
                  }
                  setShareError('');
                  setShareForm({ alias: user.name, email: user.email, role: user.role, room: folder.name.replace('공유 세션: ', '') });
                  grantFolderAccess(folder);
                }}
              >
                공유 세션 입장
              </button>
              <div className="password-reset-box">
                <h3>비밀번호 찾기</h3>
                <label>
                  이메일
                  <input type="email" value={shareForm.resetEmail} onChange={(event) => setShareForm({ resetEmail: event.target.value })} placeholder="등록된 이메일" />
                </label>
                <div className="inline-actions">
                  <button type="button" className="secondary" onClick={() => requestSharedResetCode(folder)}>인증번호 발송</button>
                </div>
                {shareForm.resetNotice && <p className="muted">{shareForm.resetNotice}</p>}
                <label>
                  인증번호
                  <input value={shareForm.resetCode} onChange={(event) => setShareForm({ resetCode: event.target.value })} placeholder="123456" />
                </label>
                <label>
                  새 비밀번호
                  <input type="password" value={shareForm.resetNewPassword} onChange={(event) => setShareForm({ resetNewPassword: event.target.value })} placeholder="새 비밀번호" />
                </label>
                <button type="button" onClick={() => resetSharedPassword(folder)}>비밀번호 재설정</button>
              </div>
            </>
          ) : (
            <>
              <label htmlFor="lock-password">폴더 비밀번호</label>
              <input id="lock-password" type="password" value={lockPassword} onChange={(event) => setLockPassword(event.target.value)} placeholder="비밀번호 입력" />
              <button type="button" onClick={unlockFolder}>잠금 해제</button>
            </>
          )}
          <p className="muted">{folder.passwordHint}</p>
          {shareError && folder.type === 'shared' && <p role="alert" className="error-text">{shareError}</p>}
          {lockError && <p role="alert" className="error-text">{lockError}</p>}
        </div>
      ) : (
        <>
          <div className="file-workspace-grid">
            <div className="file-list-panel">
              <div className="file-toolbar">
                <div>
                  <p className="eyebrow">CREATE</p>
                  <h3>파일 생성</h3>
                </div>
                <button type="button" onClick={addFile}>생성</button>
              </div>
              <div className="preset-grid" aria-label="파일 유형 선택">
                {Object.entries(filePresets).map(([type, preset]) => (
                  <button
                    type="button"
                    key={type}
                    className={newFileType === type ? 'preset-chip active' : 'preset-chip'}
                    onClick={() => {
                      setNewFileType(type);
                      setNewFileName(preset.fileName);
                    }}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
              <div className="inline-form file-create">
                <input value={newFileName} onChange={(event) => setNewFileName(event.target.value)} aria-label="새 파일명" placeholder={(filePresets[newFileType] ?? filePresets.md).fileName} />
              </div>
              {fileCreationError && <p role="alert" className="error-text">{fileCreationError}</p>}

              <MeetingWorkerCreateBox
                uploadedAudioName={uploadedAudioName}
                uploadError={uploadError}
                transcript={transcript}
                meetingReady={meetingReady}
                meetingJobState={meetingJobState}
                handleMeetingAudioUpload={handleMeetingAudioUpload}
                runMeetingWorker={runMeetingWorker}
              />

              <div className="file-list">
                {folder.files.map((file) => (
                  <div
                    key={file.id}
                    className={selectedFileId === file.id ? 'file-row active' : 'file-row'}
                  >
                    <button
                      type="button"
                      className="file-main-action"
                      onClick={() => setSelectedFileId(file.id)}
                    >
                      <strong>{file.name}</strong>
                      <span>{file.type}</span>
                    </button>
                    <div className="file-actions" aria-label={`${file.name} 작업`}>
                      <button type="button" className="file-action-button" onClick={() => setSelectedFileId(file.id)}>
                        조회
                      </button>
                      <button type="button" className="file-action-button" onClick={() => setSelectedFileId(file.id)}>
                        수정
                      </button>
                      <button type="button" className="file-action-button danger" onClick={() => deleteFile(file.id)}>
                        삭제
                      </button>
                    </div>
                  </div>
                ))}
                {folder.files.length === 0 && <div className="empty-state">아직 파일이 없습니다. 회의록, 주간보고, 마감일 또는 md/html/json 파일을 생성하세요.</div>}
              </div>
            </div>
            <FileDetailPanel
              selectedFile={selectedFile}
              updateFileContent={updateFileContent}
              saveFile={saveFile}
              fileSaveState={fileSaveState}
              fileError={fileError}
            />
          </div>
          {folder.type === 'shared' && (
            <>
            <SharedUserPanel
              folder={folder}
              shareForm={shareForm}
              setShareForm={setShareForm}
              shareError={shareError}
              addSharedUser={addSharedUser}
              changeSharedPassword={changeSharedPassword}
            />
            </>
          )}
        </>
      )}
    </section>
  );
}

function FileDetailPanel({ selectedFile, updateFileContent, saveFile, fileSaveState, fileError }) {
  if (!selectedFile) {
    return (
      <div className="file-detail-panel empty">
        <p className="eyebrow">READ</p>
        <h3>파일 조회</h3>
        <p className="muted">왼쪽 목록에서 파일을 선택하면 내용 조회와 수정 영역이 열립니다.</p>
      </div>
    );
  }

  const preview = buildPreview(selectedFile);

  return (
    <div className="file-detail-panel">
      <div className="file-detail-head">
        <div>
          <p className="eyebrow">READ / EDIT</p>
          <h3>{selectedFile.name}</h3>
        </div>
        <span className={fileSaveState === 'saved' ? 'status-pill' : 'status-pill warning'}>{fileSaveState === 'saved' ? '저장됨' : '미저장'}</span>
      </div>
      {!['md', 'html', 'json'].includes(selectedFile.type) && <p role="alert" className="error-text">지원하지 않는 파일 형식입니다. md, html, json만 편집할 수 있습니다.</p>}
      {fileError && <p role="alert" className="error-text">{fileError}</p>}
      <textarea value={selectedFile.content} onChange={(event) => updateFileContent(event.target.value)} aria-label="파일 내용" />
      <div className="action-row compact">
        <button type="button" onClick={saveFile}>수정 저장</button>
      </div>
      <div className="preview-panel inline-preview">
        <h3>조회 미리보기</h3>
        {preview.kind === 'html' && <div className="rendered-preview" dangerouslySetInnerHTML={{ __html: preview.content }} />}
        {preview.kind === 'code' && <pre>{preview.content}</pre>}
        {preview.kind === 'error' && <p role="alert" className="error-text">{preview.content}</p>}
      </div>
    </div>
  );
}

function MeetingWorkerCreateBox({ uploadedAudioName, uploadError, transcript, meetingReady, meetingJobState, handleMeetingAudioUpload, runMeetingWorker }) {
  return (
    <div className="meeting-worker-create">
      <div className="meeting-worker-head">
        <div>
          <p className="eyebrow">MEETING</p>
          <h3>회의록 녹음본</h3>
        </div>
        <JobState state={meetingJobState} onRetry={runMeetingWorker} />
      </div>
      <div className="ai-worker-flow">
        <label className="audio-drop">
          <span>녹음본 업로드</span>
          <input type="file" accept=".mp3,.wav,.m4a,audio/*" onChange={(event) => handleMeetingAudioUpload(event.target.files?.[0])} />
        </label>
        <button type="button" onClick={runMeetingWorker} disabled={meetingJobState === 'running'}>
          {meetingJobState === 'running' ? '처리 중' : 'AI 워커에 맡기기'}
        </button>
      </div>
      {uploadedAudioName && <p className="muted">선택된 녹음본: {uploadedAudioName}</p>}
      {uploadError && <p role="alert" className="error-text">{uploadError}</p>}
      <div className="worker-progress" aria-label="AI 워커 프로세스">
        <span className={uploadedAudioName ? 'active' : ''}>업로드</span>
        <span className={meetingJobState === 'running' || meetingReady ? 'active' : ''}>STT</span>
        <span className={meetingReady ? 'active' : ''}>요약</span>
        <span className={meetingReady ? 'active' : ''}>파일 생성</span>
      </div>
      {meetingReady && (
        <div className="ai-worker-output">
          <strong>AI_회의록.md 생성됨</strong>
          <p>{transcript}</p>
        </div>
      )}
    </div>
  );
}

function SharedUserPanel({ folder, shareForm, setShareForm, shareError, addSharedUser, changeSharedPassword }) {
  const isAdmin = shareForm.role === 'admin';

  return (
    <div className="shared-user-panel">
      <div className="section-heading compact-heading">
        <div>
          <p className="eyebrow">USERS</p>
          <h3>공유 사용자</h3>
        </div>
        <span className="status-pill">{isAdmin ? '관리자' : '사용자'}</span>
      </div>
      <div className="shared-user-list">
        {(folder.users ?? []).map((user) => (
          <div className="shared-user-row" key={user.id}>
            <div>
              <strong>{user.name}</strong>
              <span>{user.email}</span>
            </div>
            <em>{user.role === 'admin' ? '관리자' : '사용자'}</em>
          </div>
        ))}
      </div>

      {isAdmin && (
        <div className="shared-user-form">
          <h3>사용자 추가</h3>
          <div className="shared-login-grid">
            <label>
              이름
              <input value={shareForm.inviteName} onChange={(event) => setShareForm({ inviteName: event.target.value })} placeholder="사용자 이름" />
            </label>
            <label>
              이메일
              <input type="email" value={shareForm.inviteEmail} onChange={(event) => setShareForm({ inviteEmail: event.target.value })} placeholder="user@company.com" />
            </label>
            <label>
              비밀번호
              <input type="password" value={shareForm.invitePassword} onChange={(event) => setShareForm({ invitePassword: event.target.value })} placeholder="초기 비밀번호" />
            </label>
          </div>
          <button type="button" onClick={() => addSharedUser(folder)}>사용자 추가</button>
        </div>
      )}

      <div className="shared-user-form">
        <h3>내 비밀번호 변경</h3>
        <div className="shared-login-grid">
          <label>
            현재 비밀번호
            <input type="password" value={shareForm.currentPassword} onChange={(event) => setShareForm({ currentPassword: event.target.value })} />
          </label>
          <label>
            새 비밀번호
            <input type="password" value={shareForm.newPassword} onChange={(event) => setShareForm({ newPassword: event.target.value })} />
          </label>
        </div>
        <button type="button" className="secondary" onClick={() => changeSharedPassword(folder)}>비밀번호 변경</button>
      </div>
      {shareError && <p role="alert" className="error-text">{shareError}</p>}
    </div>
  );
}

function SharedChat({ roomName, shareForm, setShareForm, shareMessageDraft, setShareMessageDraft, sharedMessages, setSharedMessages }) {
  const composingRef = useRef(false);

  const sendMessage = () => {
    if (composingRef.current) return;
    const text = shareMessageDraft.trim();
    if (!text) return;
    const now = new Date();
    const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    setSharedMessages([
      ...sharedMessages,
      {
        id: `m-${Date.now()}`,
        alias: shareForm.alias.trim() || '나',
        author: 'me',
        text,
        time
      }
    ]);
    setShareMessageDraft('');
  };

  return (
    <div className="chat-room">
      <div className="chat-room-header">
        <div>
          <strong>{roomName}</strong>
          <span>{shareForm.alias || '나'} 님의 공유 작업 공간</span>
        </div>
        <input
          className="alias-input"
          value={shareForm.alias}
          onChange={(event) => setShareForm({ alias: event.target.value })}
          aria-label="내 별칭"
          placeholder="내 별칭"
        />
      </div>

      <div className="chat-thread" aria-label="공유 세션 메시지">
        {sharedMessages.map((message) => (
          <article key={message.id} className={message.author === 'me' ? 'chat-message mine' : 'chat-message theirs'}>
            <div className="chat-meta">
              <span>{message.author === 'me' ? shareForm.alias || '나' : message.alias}</span>
              <time>{message.time}</time>
            </div>
            <p>{message.text}</p>
          </article>
        ))}
      </div>

      <div className="chat-composer">
        <input
          value={shareMessageDraft}
          onChange={(event) => setShareMessageDraft(event.target.value)}
          onCompositionStart={() => {
            composingRef.current = true;
          }}
          onCompositionEnd={() => {
            composingRef.current = false;
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.nativeEvent.isComposing && event.keyCode !== 229) {
              event.preventDefault();
              sendMessage();
            }
          }}
          placeholder="공유 세션에 메시지 남기기"
          aria-label="공유 세션 메시지"
        />
        <button type="button" onClick={sendMessage}>전송</button>
      </div>
    </div>
  );
}

function FloatingSharedChat({ open, setOpen, roomName, shareForm, setShareForm, shareMessageDraft, setShareMessageDraft, sharedMessages, setSharedMessages }) {
  return (
    <div className={open ? 'floating-chat open' : 'floating-chat'}>
      {open && (
        <div className="floating-chat-panel">
          <SharedChat
            roomName={roomName}
            shareForm={shareForm}
            setShareForm={setShareForm}
            shareMessageDraft={shareMessageDraft}
            setShareMessageDraft={setShareMessageDraft}
            sharedMessages={sharedMessages}
            setSharedMessages={setSharedMessages}
          />
        </div>
      )}
      <button type="button" className="floating-chat-button" onClick={() => setOpen(!open)} aria-label="공유 세션 채팅 열기">
        {open ? '닫기' : '채팅'}
      </button>
    </div>
  );
}

function SharePanel({
  shareForm,
  setShareForm,
  shareJoined,
  setShareJoined,
  shareError,
  setShareError,
  shareMessageDraft,
  setShareMessageDraft,
  sharedMessages,
  setSharedMessages
}) {
  const joinSharedSession = () => {
    if (!shareForm.room.trim() || !shareForm.alias.trim()) {
      setShareError('세션 이름과 별칭은 필수입니다.');
      setShareJoined(false);
      return;
    }
    if (shareForm.room.trim() === '제품팀' && shareForm.password !== 'team123') {
      setShareError('제품팀 공유 세션은 데모 비밀번호 team123 확인 후 입장할 수 있습니다.');
      setShareJoined(false);
      return;
    }
    setShareError('');
    setShareJoined(true);
  };

  const sendMessage = () => {
    const text = shareMessageDraft.trim();
    if (!text) return;
    const now = new Date();
    const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    setSharedMessages([
      ...sharedMessages,
      {
        id: `m-${Date.now()}`,
        alias: shareForm.alias.trim() || '나',
        author: 'me',
        text,
        time
      }
    ]);
    setShareMessageDraft('');
  };

  return (
    <section className="panel wide">
      <div className="section-heading">
        <div>
          <p className="eyebrow">SCR-SHARE-001 / REQ-SHARE-001</p>
          <h2>별칭 기반 공유 세션</h2>
        </div>
      </div>
      <div className="form-grid">
        <label>세션 이름<input value={shareForm.room} onChange={(event) => setShareForm({ ...shareForm, room: event.target.value })} /></label>
        <label>별칭<input value={shareForm.alias} onChange={(event) => setShareForm({ ...shareForm, alias: event.target.value })} /></label>
        <label>선택 비밀번호<input value={shareForm.password} onChange={(event) => setShareForm({ ...shareForm, password: event.target.value })} placeholder="제품팀 데모: team123" /></label>
      </div>
      <button type="button" onClick={joinSharedSession}>공유 세션 입장</button>
      {shareError && <p role="alert" className="error-text">{shareError}</p>}
      {shareJoined && (
        <div className="chat-room">
          <div className="chat-room-header">
            <div>
              <strong>{shareForm.room}</strong>
              <span>{shareForm.alias} 님으로 입장 중</span>
            </div>
            <span className="status-pill">별칭 기록</span>
          </div>

          <div className="chat-thread" aria-label="공유 세션 메시지">
            {sharedMessages.map((message) => (
              <article key={message.id} className={message.author === 'me' ? 'chat-message mine' : 'chat-message theirs'}>
                <div className="chat-meta">
                  <span>{message.author === 'me' ? shareForm.alias : message.alias}</span>
                  <time>{message.time}</time>
                </div>
                <p>{message.text}</p>
              </article>
            ))}
          </div>

          <div className="chat-composer">
            <input
              value={shareMessageDraft}
              onChange={(event) => setShareMessageDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') sendMessage();
              }}
              placeholder="공유 세션에 메시지 남기기"
              aria-label="공유 세션 메시지"
            />
            <button type="button" onClick={sendMessage}>전송</button>
          </div>
        </div>
      )}
    </section>
  );
}

function FileEditor({ folderLocked, selectedFile, updateFileContent, saveFile, fileSaveState, fileError, fileCreationError, addFile, newFileName, setNewFileName }) {
  if (folderLocked) {
    return <section className="panel wide"><h2>파일 편집</h2><p>잠긴 폴더는 비밀번호 확인 후 편집할 수 있습니다.</p></section>;
  }

  if (!selectedFile) {
    return (
      <section className="panel wide">
        <h2>파일 편집</h2>
        <div className="inline-form file-create">
          <input value={newFileName} onChange={(event) => setNewFileName(event.target.value)} aria-label="새 파일명" />
          <button type="button" onClick={addFile}>파일 생성</button>
        </div>
        {fileCreationError && <p role="alert" className="error-text">{fileCreationError}</p>}
      </section>
    );
  }

  const preview = buildPreview(selectedFile);

  return (
    <section className="editor-grid">
      <div className="panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">SCR-FILE-001</p>
            <h2>{selectedFile.name}</h2>
          </div>
          <span className={fileSaveState === 'saved' ? 'status-pill' : 'status-pill warning'}>{fileSaveState === 'saved' ? '저장됨' : '미저장 변경'}</span>
        </div>
        {!['md', 'html', 'json'].includes(selectedFile.type) && <p role="alert" className="error-text">지원하지 않는 파일 형식입니다. md, html, json만 편집할 수 있습니다.</p>}
        {fileError && <p role="alert" className="error-text">{fileError}</p>}
        <textarea value={selectedFile.content} onChange={(event) => updateFileContent(event.target.value)} aria-label="파일 내용" />
        <div className="action-row compact">
          <button type="button" onClick={saveFile}>저장</button>
          <button type="button" className="secondary" onClick={addFile}>새 파일</button>
        </div>
      </div>
      <div className="panel preview-panel">
        <h2>미리보기</h2>
        {preview.kind === 'html' && <div className="rendered-preview" dangerouslySetInnerHTML={{ __html: preview.content }} />}
        {preview.kind === 'code' && <pre>{preview.content}</pre>}
        {preview.kind === 'error' && <p role="alert" className="error-text">{preview.content}</p>}
      </div>
    </section>
  );
}

function validateAudioFile(file) {
  if (!file) return { ok: false, message: '파일이 선택되지 않았습니다.' };
  const allowed = ['mp3', 'wav', 'm4a'];
  const extension = file.name.split('.').pop()?.toLowerCase();
  if (!allowed.includes(extension)) return { ok: false, message: 'mp3, wav, m4a 파일만 업로드할 수 있습니다.' };
  if (file.size > 50 * 1024 * 1024) return { ok: false, message: '50MB 이하 파일만 업로드할 수 있습니다.' };
  return { ok: true, message: '' };
}

function runMockJob(setJobState, onSuccess) {
  setJobState('running');
  window.setTimeout(() => {
    onSuccess();
    setJobState('succeeded');
  }, 450);
}

function JobState({ state, onRetry }) {
  const labels = {
    idle: '대기',
    running: '실행 중',
    succeeded: '완료',
    failed: '실패'
  };
  return (
    <div className={`job-state ${state}`}>
      <span>AI 상태: {labels[state]}</span>
      {state === 'failed' && <button type="button" className="secondary" onClick={onRetry}>재시도</button>}
    </div>
  );
}

function MeetingPanel({ transcript, setTranscript, meetingReady, setMeetingReady, jobState, setJobState, uploadedAudioName, setUploadedAudioName, uploadError, setUploadError }) {
  const handleAudioUpload = (event) => {
    const file = event.target.files?.[0];
    const result = validateAudioFile(file);
    if (!result.ok) {
      setUploadedAudioName('');
      setUploadError(result.message);
      return;
    }
    setUploadError('');
    setUploadedAudioName(file.name);
  };

  const generateSummary = () => {
    if (!uploadedAudioName) {
      setUploadError('회의록 생성을 위해 먼저 오디오 파일을 선택하세요.');
      setJobState('failed');
      return;
    }
    runMockJob(setJobState, () => setMeetingReady(true));
  };

  return (
    <section className="panel wide">
      <p className="eyebrow">REQ-AUDIO-001 / REQ-MEETING-001</p>
      <h2>공통 음성 입력과 회의록 요약</h2>
      <label className="upload-box">
        녹음 파일 업로드 · mp3, wav, m4a · 50MB 이하
        <input type="file" accept=".mp3,.wav,.m4a,audio/*" onChange={handleAudioUpload} />
      </label>
      {uploadedAudioName && <p className="muted">선택된 파일: {uploadedAudioName}</p>}
      {uploadError && <p role="alert" className="error-text">{uploadError}</p>}
      <label className="stacked">STT 원문<textarea value={transcript} onChange={(event) => setTranscript(event.target.value)} /></label>
      <div className="action-row compact">
        <button type="button" onClick={generateSummary} disabled={jobState === 'running'}>회의록 요약 생성</button>
        <button type="button" className="secondary" onClick={() => setJobState('failed')}>실패 상태 확인</button>
      </div>
      <JobState state={jobState} onRetry={generateSummary} />
      {meetingReady && (
        <div className="output-box">
          <h3>요약 결과</h3>
          <p>화면 프로토타입과 API 계약 확정이 핵심 액션으로 도출되었습니다. 원문은 시간 기록과 데드라인 추출에도 재사용됩니다.</p>
        </div>
      )}
    </section>
  );
}

function ReportPanel({ reportReady, setReportReady, jobState, setJobState }) {
  const generateReport = () => runMockJob(setJobState, () => setReportReady(true));

  return (
    <section className="panel wide">
      <p className="eyebrow">REQ-WEEKLY-001</p>
      <h2>주간 보고 초안</h2>
      <div className="form-grid">
        <label>시작일<input type="date" defaultValue="2026-05-04" /></label>
        <label>종료일<input type="date" defaultValue="2026-05-10" /></label>
      </div>
      <div className="action-row compact">
        <button type="button" onClick={generateReport} disabled={jobState === 'running'}>보고서 초안 생성</button>
        <button type="button" className="secondary" onClick={() => setJobState('failed')}>실패 상태 확인</button>
      </div>
      <JobState state={jobState} onRetry={generateReport} />
      {reportReady && <div className="output-box">이번 주는 폴더 기반 세션 구조, 파일 편집, 음성 처리 흐름을 검토했습니다. 다음 주는 API 계약과 저장 정책을 확정합니다.</div>}
    </section>
  );
}

function DeadlinePanel({ deadlineReady, setDeadlineReady, jobState, setJobState, selectedDeadlineIndex, setSelectedDeadlineIndex }) {
  const deadlines = deadlineReady
    ? [
        { date: '2026-05-10', title: '화면 프로토타입 검토', source: '회의록 요약' },
        { date: '2026-05-12', title: 'API 계약 확정', source: 'STT 원문' },
        { date: '2026-05-15', title: '저장 방식 결정', source: '설계 미결정 항목' }
      ]
    : [
        { date: '2026-05-10', title: '화면 프로토타입 검토', source: '회의록 요약' },
        { date: '2026-05-12', title: 'API 계약 확정', source: 'STT 원문' }
      ];
  const selected = deadlines[selectedDeadlineIndex] ?? deadlines[0];
  const generateDeadlines = () => runMockJob(setJobState, () => setDeadlineReady(true));

  return (
    <section className="panel wide">
      <p className="eyebrow">REQ-DEADLINE-001</p>
      <h2>캘린더와 마감일 후보</h2>
      <div className="action-row compact">
        <button type="button" onClick={generateDeadlines} disabled={jobState === 'running'}>AI 마감일 추출</button>
        <button type="button" className="secondary" onClick={() => setJobState('failed')}>실패 상태 확인</button>
      </div>
      <JobState state={jobState} onRetry={generateDeadlines} />
      <div className="timeline">
        {deadlines.map((deadline, index) => (
          <button type="button" key={`${deadline.date}-${deadline.title}`} className={index === selectedDeadlineIndex ? 'timeline-item active' : 'timeline-item'} onClick={() => setSelectedDeadlineIndex(index)}>
            {deadline.date} {deadline.title}
          </button>
        ))}
      </div>
      <div className="output-box">
        <h3>{selected.date} · {selected.title}</h3>
        <p>출처: {selected.source}</p>
        <div className="action-row compact">
          <button type="button" className="secondary" onClick={() => setSelectedDeadlineIndex(Math.max(0, selectedDeadlineIndex - 1))}>이전</button>
          <button type="button" className="secondary" onClick={() => setSelectedDeadlineIndex(Math.min(deadlines.length - 1, selectedDeadlineIndex + 1))}>다음</button>
        </div>
      </div>
    </section>
  );
}

function TimePanel({ timeReady, setTimeReady, transcript, jobState, setJobState, uploadedAudioName }) {
  const generateTimeLog = () => {
    if (!uploadedAudioName) {
      setJobState('failed');
      return;
    }
    runMockJob(setJobState, () => setTimeReady(true));
  };

  return (
    <section className="panel wide">
      <p className="eyebrow">REQ-TIME-001 / REQ-TIME-002</p>
      <h2>시간 기록 대시보드</h2>
      <p className="muted">공통 STT 원문: {transcript}</p>
      <p className="muted">공유 음성 소스: {uploadedAudioName || '회의록 화면에서 mp3, wav, m4a 파일을 먼저 선택해야 합니다.'}</p>
      <div className="action-row compact">
        <button type="button" onClick={generateTimeLog} disabled={jobState === 'running'}>활동별 가중치 제안</button>
        <button type="button" className="secondary" onClick={() => setJobState('failed')}>실패 상태 확인</button>
      </div>
      <JobState state={jobState} onRetry={generateTimeLog} />
      {timeReady && (
        <div className="activity-grid">
          {['기획 검토|2.5h · 중요도 높음', '회의 정리|1.0h · 집중도 보통', '문서화|1.5h · 중요도 높음'].map((item) => {
            const [title, meta] = item.split('|');
            return (
              <BorderGlow key={title} className="item-card" borderRadius={18} glowRadius={18}>
                <div><strong>{title}</strong><span>{meta}</span></div>
              </BorderGlow>
            );
          })}
        </div>
      )}
    </section>
  );
}

function LaterPanel({ title, requirement, description }) {
  return (
    <section className="panel wide later-panel">
      <p className="eyebrow">후순위 범위 · {requirement}</p>
      <h2>{title}</h2>
      <p>{description}</p>
      <div className="output-box">상태: MVP 제외, 분석/설계 후 구현 예정</div>
    </section>
  );
}

createRoot(document.getElementById('root')).render(<App />);
