import { create } from 'zustand';

export const foldersSeed = [
  {
    id: 'personal-strategy',
    name: '개인 업무',
    type: 'personal',
    locked: true,
    password: '1234',
    passwordHint: '데모 잠금 폴더입니다.',
    files: [
      { id: 'daily-note', name: '오늘_업무.md', type: 'md', content: '# 오늘 업무\n\n- 고객 미팅 정리\n- 주간 보고 초안 준비' },
      { id: 'handoff-json', name: 'handoff.json', type: 'json', content: '{\n  "owner": "나",\n  "status": "draft"\n}' }
    ]
  },
  {
    id: 'shared-product',
    name: '공유 세션: 제품팀',
    type: 'shared',
    locked: true,
    passwordHint: '등록된 이메일과 비밀번호로 입장하세요. 데모 인증번호는 123456입니다.',
    users: [
      { id: 'user-admin', name: '민지', email: 'admin@company.test', password: 'team123', role: 'admin', verificationCode: '123456' },
      { id: 'user-junho', name: '준호', email: 'junho@company.test', password: 'junho123', role: 'member', verificationCode: '123456' }
    ],
    files: [
      { id: 'meeting-summary', name: '회의록.html', type: 'html', content: '<h2>제품 회의</h2><p>다음 배포 범위를 확정한다.</p>' }
    ]
  }
];

export const useWorkspaceStore = create((set) => ({
  activeTab: 'dashboard',
  folders: foldersSeed,
  selectedFolderId: 'personal-strategy',
  selectedFileId: 'daily-note',
  unlockedFolderIds: [],
  accessGrants: {},
  folderName: '',
  folderSearchQuery: '',
  folderCreateOpen: false,
  folderCreateType: 'personal',
  folderCreatePassword: '',
  folderCreateEmail: '',
  folderCreateAlias: '',
  newFileName: '새_문서.md',
  newFileType: 'md',
  lockPassword: '',
  lockError: '',
  shareForm: {
    room: '제품팀',
    alias: '민지',
    email: '',
    password: '',
    role: '',
    resetEmail: '',
    resetCode: '',
    resetNewPassword: '',
    resetNotice: '',
    inviteName: '',
    inviteEmail: '',
    invitePassword: '',
    currentPassword: '',
    newPassword: ''
  },
  shareJoined: false,
  sharedChatOpen: false,
  shareError: '',
  shareMessageDraft: '',
  sharedMessages: [
    { id: 'm1', alias: '준호', author: 'other', text: '오늘 회의록 파일 먼저 확인할게요.', time: '10:12' },
    { id: 'm2', alias: '서연', author: 'other', text: '마감일 후보는 캘린더 화면에 반영하면 좋겠습니다.', time: '10:14' },
    { id: 'm3', alias: '민지', author: 'me', text: '좋아요. 저는 주간 보고 초안 쪽을 정리할게요.', time: '10:16' }
  ],
  transcript: '회의에서 5월 10일까지 화면 프로토타입을 검토하고, 5월 12일까지 API 계약을 확정하기로 했다.',
  meetingReady: false,
  reportReady: false,
  deadlineReady: false,
  timeReady: false,
  meetingJobState: 'idle',
  reportJobState: 'idle',
  deadlineJobState: 'idle',
  timeJobState: 'idle',
  uploadError: '',
  uploadedAudioName: '',
  fileSaveState: 'saved',
  fileError: '',
  fileCreationError: '',
  selectedDeadlineIndex: 0,

  setField: (key, value) => set({ [key]: value }),
  setShareForm: (patch) => set((state) => ({ shareForm: { ...state.shareForm, ...patch } })),
  setFolders: (updater) => set((state) => ({ folders: typeof updater === 'function' ? updater(state.folders) : updater })),
  setAccessGrants: (accessGrants) => set({ accessGrants }),
  unlockFolderId: (folderId) =>
    set((state) => ({
      unlockedFolderIds: [...new Set([...state.unlockedFolderIds, folderId])]
    })),
  lockFolderId: (folderId) =>
    set((state) => ({
      unlockedFolderIds: state.unlockedFolderIds.filter((id) => id !== folderId)
    }))
}));
