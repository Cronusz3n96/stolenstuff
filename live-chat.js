(function () {
  const CHAT_API_ORIGIN = typeof window !== 'undefined' && typeof window.__CHAT_API_ORIGIN__ === 'string' && window.__CHAT_API_ORIGIN__
    ? window.__CHAT_API_ORIGIN__.replace(/\/+$/, '')
    : ((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') && window.location.port !== '8090'
      ? 'http://127.0.0.1:8090'
      : window.location.origin);

  const pb = typeof window.PocketBase === 'function'
    ? new window.PocketBase(CHAT_API_ORIGIN)
    : null;

  const state = {
    session: null,
    accountLock: {
      active: false,
      reason: '',
      detail: ''
    },
    bootstrap: null,
    activeView: 'groups',
    activeRoomId: '',
    activeRoom: null,
    sessionRequest: null,
    bootstrapRequest: null,
    activeRoomRequest: null,
    lastRenderedMessagesKey: '',
    siteStateRequest: null,
    adminReportsRequest: null,
    modsDirectoryRequest: null,
    transientDmRoom: null,
    roomPollHandle: null,
    bootstrapPollHandle: null,
    sessionPollHandle: null,
    siteStateHandle: null,
    adminReportsHandle: null,
    adminReports: [],
    modsDirectory: [],
    adminReportMode: 'owner',
    pendingReportMessage: null,
    pendingGroupAvatarFile: null,
    pendingManageGroupAvatarFile: null,
    pendingChatImageFile: null,
    pendingReply: null,
    mentionSuggestions: [],
    mentionSelectedIndex: 0,
    mentionQuery: '',
    mentionAnchorIndex: -1,
    mentionLookupHandle: null,
    manageGroupRoomId: '',
    openMessageMenuId: '',
    activeAudio: null,
    activeAudioStopHandle: null,
    broadcastToastHandle: null,
    broadcastHideHandle: null,
    mentionToastHandle: null,
    mentionHideHandle: null,
    mentionToastQueue: [],
    mentionToastSeenKeys: {},
    mentionToastCooldowns: {},
    mentionToastRoomId: '',
    mentionToastRoomType: '',
    trollMediaHandle: null,
    trollMediaHideHandle: null,
    flashbangHandle: null,
    flashbangFadeHandle: null,
    bustHandle: null,
    bustFadeHandle: null,
    nukeSequenceHandle: null,
    nukeHideHandle: null,
    activeFlashbangNonce: '',
    activeBustNonce: '',
    activeNukeNonce: '',
    lastBroadcastKey: '',
    hasSeenSiteState: false,
    siteState: {
      broadcastMessage: '',
      pinnedMessage: '',
      trollRollNonce: '',
      trollSoundNonce: '',
      trollSoundUrl: '',
      trollMediaNonce: '',
      trollMediaUrl: '',
      trollFlashbangNonce: '',
      trollFlashbangTriggeredAt: '',
      trollBustNonce: '',
      trollBustTriggeredAt: '',
      trollNukeNonce: '',
      trollNukeTriggeredAt: '',
      updated: ''
    },
    crop: {
      image: null,
      objectUrl: '',
      zoom: 1,
      baseScale: 1,
      offsetX: 0,
      offsetY: 0,
      dragging: false,
      dragStartX: 0,
      dragStartY: 0,
      startOffsetX: 0,
      startOffsetY: 0,
      target: ''
    }
  };

  if (pb) {
    pb.autoCancellation(false);
  }

  function getElements() {
    return {
      mainContainer: document.getElementById('main-container'),
      chatSection: document.getElementById('chat-section'),
      chatTab: document.getElementById('chatTab'),
      accountTab: document.getElementById('accountTab'),
      adminTab: document.getElementById('adminTab'),
      siteBroadcastBanner: document.getElementById('siteBroadcastBanner'),
      siteMentionToast: document.getElementById('siteMentionToast'),
      siteMentionToastAvatar: document.getElementById('siteMentionToastAvatar'),
      siteMentionToastAvatarImage: document.getElementById('siteMentionToastAvatarImage'),
      siteMentionToastAvatarFallback: document.getElementById('siteMentionToastAvatarFallback'),
      siteMentionToastTitle: document.getElementById('siteMentionToastTitle'),
      siteMentionToastBody: document.getElementById('siteMentionToastBody'),

      chatAppShell: document.getElementById('chatAppShell'),
      chatAppLock: document.getElementById('chatAppLock'),
      videoAuthLock: document.getElementById('videoAuthLock'),
      videoApp: document.getElementById('videoApp'),
      chatModeTabs: document.getElementById('chatModeTabs'),
      chatSidebarKicker: document.getElementById('chatSidebarKicker'),
      chatSidebarHeading: document.getElementById('chatSidebarHeading'),
      chatSidebarPrimaryButton: document.getElementById('chatSidebarPrimaryButton'),
      chatAddFriendForm: document.getElementById('chatAddFriendForm'),
      chatAddFriendInput: document.getElementById('chatAddFriendInput'),
      chatIncomingRequestsSection: document.getElementById('chatIncomingRequestsSection'),
      chatIncomingRequestsList: document.getElementById('chatIncomingRequestsList'),
      chatOutgoingRequestsSection: document.getElementById('chatOutgoingRequestsSection'),
      chatOutgoingRequestsList: document.getElementById('chatOutgoingRequestsList'),
      chatBlockedSection: document.getElementById('chatBlockedSection'),
      chatBlockedList: document.getElementById('chatBlockedList'),
      chatConversationList: document.getElementById('chatConversationList'),
      chatMainEmpty: document.getElementById('chatMainEmpty'),
      chatRoomPanel: document.getElementById('chatRoomPanel'),
      chatRoomAvatar: document.getElementById('chatRoomAvatar'),
      chatRoomAvatarImage: document.getElementById('chatRoomAvatarImage'),
      chatRoomAvatarFallback: document.getElementById('chatRoomAvatarFallback'),
      chatRoomTitle: document.getElementById('chatRoomTitle'),
      chatRoomSubtitle: document.getElementById('chatRoomSubtitle'),
      chatRoomActions: document.getElementById('chatRoomActions'),
      chatClearBanner: document.getElementById('chatClearBanner'),
      chatPinnedBanner: document.getElementById('chatPinnedBanner'),
      chatMessageList: document.getElementById('chatMessageList'),
      chatStatusBanner: document.getElementById('chatStatusBanner'),
      chatComposer: document.getElementById('chatComposer'),
      chatImageInput: document.getElementById('chatImageInput'),
      chatImageButton: document.getElementById('chatImageButton'),
      chatComposerMeta: document.getElementById('chatComposerMeta'),
      chatMentionMenu: document.getElementById('chatMentionMenu'),
      chatReplyChip: document.getElementById('chatReplyChip'),
      chatReplyAuthor: document.getElementById('chatReplyAuthor'),
      chatReplyPreview: document.getElementById('chatReplyPreview'),
      chatReplyClear: document.getElementById('chatReplyClear'),
      chatAttachmentChip: document.getElementById('chatAttachmentChip'),
      chatAttachmentName: document.getElementById('chatAttachmentName'),
      chatAttachmentClear: document.getElementById('chatAttachmentClear'),
      chatMessageInput: document.getElementById('chatMessageInput'),
      chatSendButton: document.getElementById('chatSendButton'),

      accountAuthCard: document.getElementById('accountAuthCard'),
      accountProfileCard: document.getElementById('accountProfileCard'),
      accountStatusCard: document.getElementById('accountStatusCard'),
      accountUsernameCard: document.getElementById('accountUsernameCard'),
      accountPasswordCard: document.getElementById('accountPasswordCard'),
      accountDangerCard: document.getElementById('accountDangerCard'),
      accountSignupForm: document.getElementById('accountSignupForm'),
      accountLoginForm: document.getElementById('accountLoginForm'),
      accountUsernameForm: document.getElementById('accountUsernameForm'),
      accountPasswordForm: document.getElementById('accountPasswordForm'),
      signupUsername: document.getElementById('signupUsername'),
      signupPassword: document.getElementById('signupPassword'),
      signupPasswordConfirm: document.getElementById('signupPasswordConfirm'),
      loginUsername: document.getElementById('loginUsername'),
      loginPassword: document.getElementById('loginPassword'),
      accountProfileUsername: document.getElementById('accountProfileUsername'),
      accountProfileCreated: document.getElementById('accountProfileCreated'),
      accountWarningsCount: document.getElementById('accountWarningsCount'),
      accountUsernameChangeTime: document.getElementById('accountUsernameChangeTime'),
      accountModerationDetail: document.getElementById('accountModerationDetail'),
      accountUsernameDescription: document.getElementById('accountUsernameDescription'),
      accountUsernameInput: document.getElementById('accountUsernameInput'),
      accountCurrentPassword: document.getElementById('accountCurrentPassword'),
      accountNewPassword: document.getElementById('accountNewPassword'),
      accountNewPasswordConfirm: document.getElementById('accountNewPasswordConfirm'),
      accountAvatarPreview: document.getElementById('accountAvatarPreview'),
      accountAvatarImage: document.getElementById('accountAvatarImage'),
      accountAvatarFallback: document.getElementById('accountAvatarFallback'),
      avatarUploadInput: document.getElementById('avatarUploadInput'),
      avatarUploadButton: document.getElementById('avatarUploadButton'),
      accountLogoutButton: document.getElementById('accountLogoutButton'),
      accountDeleteButton: document.getElementById('accountDeleteButton'),
      accountAuthFeedback: document.getElementById('accountAuthFeedback'),
      accountAvatarFeedback: document.getElementById('accountAvatarFeedback'),
      accountUsernameFeedback: document.getElementById('accountUsernameFeedback'),
      accountPasswordFeedback: document.getElementById('accountPasswordFeedback'),
      accountDangerFeedback: document.getElementById('accountDangerFeedback'),

      adminSection: document.getElementById('admin-section'),
      adminModCard: document.getElementById('adminModCard'),
      adminOwnerCard: document.getElementById('adminOwnerCard'),
      adminUserCard: document.getElementById('adminUserCard'),
      adminTrollCard: document.getElementById('adminTrollCard'),
      adminReportsCard: document.getElementById('adminReportsCard'),
      adminModUsernameInput: document.getElementById('adminModUsernameInput'),
      adminModsList: document.getElementById('adminModsList'),
      adminModsRefreshButton: document.getElementById('adminModsRefreshButton'),
      adminAddModButton: document.getElementById('adminAddModButton'),
      adminRemoveModButton: document.getElementById('adminRemoveModButton'),
      adminBroadcastInput: document.getElementById('adminBroadcastInput'),
      adminPinnedInput: document.getElementById('adminPinnedInput'),
      adminTargetUsernameInput: document.getElementById('adminTargetUsernameInput'),
      adminRenameCurrentInput: document.getElementById('adminRenameCurrentInput'),
      adminRenameNewInput: document.getElementById('adminRenameNewInput'),
      adminBroadcastSetButton: document.getElementById('adminBroadcastSetButton'),
      adminBroadcastClearButton: document.getElementById('adminBroadcastClearButton'),
      adminPinnedSetButton: document.getElementById('adminPinnedSetButton'),
      adminPinnedClearButton: document.getElementById('adminPinnedClearButton'),
      adminWipeChatButton: document.getElementById('adminWipeChatButton'),
      adminTimeoutUserButton: document.getElementById('adminTimeoutUserButton'),
      adminBanUserButton: document.getElementById('adminBanUserButton'),
      adminResetAvatarButton: document.getElementById('adminResetAvatarButton'),
      adminDeleteUserMessagesButton: document.getElementById('adminDeleteUserMessagesButton'),
      adminResetUsernameButton: document.getElementById('adminResetUsernameButton'),
      adminDeleteUserButton: document.getElementById('adminDeleteUserButton'),
      adminRenameUserButton: document.getElementById('adminRenameUserButton'),
      adminSoundInput: document.getElementById('adminSoundInput'),
      adminChooseSoundButton: document.getElementById('adminChooseSoundButton'),
      adminMediaInput: document.getElementById('adminMediaInput'),
      adminChooseMediaButton: document.getElementById('adminChooseMediaButton'),
      adminPlaySoundButton: document.getElementById('adminPlaySoundButton'),
      adminShowMediaButton: document.getElementById('adminShowMediaButton'),
      adminFlashbangButton: document.getElementById('adminFlashbangButton'),
      adminBustButton: document.getElementById('adminBustButton'),
      adminRollButton: document.getElementById('adminRollButton'),
      adminNukeButton: document.getElementById('adminNukeButton'),
      adminSoundName: document.getElementById('adminSoundName'),
      adminMediaName: document.getElementById('adminMediaName'),
      adminFeedback: document.getElementById('adminFeedback'),
      adminReportsFilter: document.getElementById('adminReportsFilter'),
      adminReportsList: document.getElementById('adminReportsList'),

      chatGroupModal: document.getElementById('chatGroupModal'),
      chatGroupForm: document.getElementById('chatGroupForm'),
      chatGroupNameInput: document.getElementById('chatGroupNameInput'),
      chatGroupUsersInput: document.getElementById('chatGroupUsersInput'),
      chatGroupAvatarInput: document.getElementById('chatGroupAvatarInput'),
      chatGroupAvatarButton: document.getElementById('chatGroupAvatarButton'),
      chatGroupAvatarName: document.getElementById('chatGroupAvatarName'),
      chatGroupCancelButton: document.getElementById('chatGroupCancelButton'),

      chatGroupManageModal: document.getElementById('chatGroupManageModal'),
      chatGroupManageForm: document.getElementById('chatGroupManageForm'),
      chatManageGroupNameInput: document.getElementById('chatManageGroupNameInput'),
      chatManageGroupUsersInput: document.getElementById('chatManageGroupUsersInput'),
      chatManageGroupAvatarInput: document.getElementById('chatManageGroupAvatarInput'),
      chatManageGroupAvatarButton: document.getElementById('chatManageGroupAvatarButton'),
      chatManageGroupAvatarName: document.getElementById('chatManageGroupAvatarName'),
      chatManageGroupCancelButton: document.getElementById('chatManageGroupCancelButton'),
      chatManageGroupSaveButton: document.getElementById('chatManageGroupSaveButton'),

      chatReportModal: document.getElementById('chatReportModal'),
      chatReportForm: document.getElementById('chatReportForm'),
      chatReportPreview: document.getElementById('chatReportPreview'),
      chatReportReasonInput: document.getElementById('chatReportReasonInput'),
      chatReportCancelButton: document.getElementById('chatReportCancelButton'),

      avatarCropModal: document.getElementById('avatarCropModal'),
      avatarCropCanvas: document.getElementById('avatarCropCanvas'),
      avatarCropZoom: document.getElementById('avatarCropZoom'),
      avatarCropApprove: document.getElementById('avatarCropApprove'),
      avatarCropCancel: document.getElementById('avatarCropCancel'),

      trollMediaOverlay: document.getElementById('trollMediaOverlay'),
      trollMediaImage: document.getElementById('trollMediaImage'),
      siteFlashbangOverlay: document.getElementById('siteFlashbangOverlay'),
      siteBustOverlay: document.getElementById('siteBustOverlay'),
      siteBustImage: document.getElementById('siteBustImage'),
      siteNukeOverlay: document.getElementById('siteNukeOverlay'),
      siteNukeTitle: document.getElementById('siteNukeTitle'),
      siteNukeTimer: document.getElementById('siteNukeTimer'),
      siteNukeNote: document.getElementById('siteNukeNote')
    };
  }

  function nowMs() {
    return Date.now();
  }

  function extractErrorMessage(error, fallback) {
    if (!error) {
      return fallback;
    }

    if (typeof error.message === 'string' && error.message) {
      return error.message;
    }

    if (error.response && typeof error.response.message === 'string' && error.response.message) {
      return error.response.message;
    }

    if (error.data && typeof error.data.message === 'string' && error.data.message) {
      return error.data.message;
    }

    return fallback;
  }

  function hasAuthToken() {
    return !!(pb && pb.authStore && pb.authStore.isValid && pb.authStore.token);
  }

  function isDocumentVisible() {
    return typeof document === 'undefined' || document.visibilityState !== 'hidden';
  }

  function isSectionVisible(id) {
    const section = typeof document !== 'undefined' ? document.getElementById(id) : null;
    return !!(section && !section.hidden && section.style.display !== 'none');
  }

  function isAuthenticated() {
    return !!(state.session && state.session.user && hasAuthToken());
  }

  function isChatSectionVisible() {
    return isSectionVisible('chat-section');
  }

  function isAdminSectionVisible() {
    return isSectionVisible('admin-section');
  }

  function shouldPollChatData() {
    return isAuthenticated() && !isAccountLocked() && isDocumentVisible() && isChatSectionVisible();
  }

  function shouldPollSiteState() {
    return isDocumentVisible();
  }

  function shouldPollAdminReports() {
    return isStaff() && isDocumentVisible() && isAdminSectionVisible();
  }

  function getCurrentRole() {
    const roleFromSession = state.session && state.session.user ? state.session.user.role : '';
    const roleFromAuth = pb && pb.authStore && pb.authStore.model ? pb.authStore.model.role : '';
    return String(roleFromSession || roleFromAuth || '').toLowerCase();
  }

  function normalizeRoleValue(role) {
    return String(role || '').toLowerCase().replace(/[^a-z0-9]/g, '').trim();
  }

  function isOwnerLikeRole(role) {
    const normalized = normalizeRoleValue(role);
    return normalized === 'owner' || normalized === 'admin' || normalized === 'coowner';
  }

  function isOwner() {
    return isOwnerLikeRole(getCurrentRole());
  }

  function isMod() {
    const role = normalizeRoleValue(getCurrentRole());
    return role === 'mod' || role === 'moderator';
  }

  function isStaff() {
    return isOwner() || isMod();
  }

  function canUseOwnerTools() {
    return isOwner();
  }

  function canUseModerationTools() {
    return isOwner() || isMod();
  }

  function normalizeUsernameValue(value) {
    let normalized = String(value || '').toLowerCase().replace(/[^a-z0-9_]/g, '');
    const firstUnderscore = normalized.indexOf('_');

    if (firstUnderscore !== -1) {
      normalized = normalized.slice(0, firstUnderscore + 1) +
        normalized.slice(firstUnderscore + 1).replace(/_/g, '');
    }

    return normalized.slice(0, 16);
  }

  function sanitizeUsernameInputValue(value) {
    return String(value || '')
      .replace(/[\u0000-\u001f\u007f]/g, '')
      .trim()
      .slice(0, 32);
  }

  function dedupeStrings(values) {
    const result = [];
    const seen = {};
    (values || []).forEach(function (entry) {
      const value = String(entry || '').trim();
      if (!value) {
        return;
      }
      const key = value.toLowerCase();
      if (seen[key]) {
        return;
      }
      seen[key] = true;
      result.push(value);
    });
    return result;
  }

  function buildUsernameCandidates(rawUsername) {
    const safeRaw = sanitizeUsernameInputValue(rawUsername);
    const normalized = normalizeUsernameValue(safeRaw);
    return dedupeStrings([
      safeRaw,
      safeRaw.toLowerCase(),
      normalized
    ]);
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function appendMessageTextWithMentions(container, value) {
    const text = String(value || '');
    const ownUsername = normalizeUsernameValue(getSessionUsername());
    const mentionRegex = /@([a-z0-9_]{1,16})/ig;
    let lastIndex = 0;
    let match = mentionRegex.exec(text);

    while (match) {
      if (match.index > lastIndex) {
        container.appendChild(document.createTextNode(text.slice(lastIndex, match.index)));
      }

      const mention = document.createElement('span');
      const username = normalizeUsernameValue(match[1] || '');
      mention.className = 'chat-inline-mention' + (ownUsername && username === ownUsername ? ' is-you' : '');
      mention.textContent = '@' + username;
      container.appendChild(mention);
      lastIndex = match.index + match[0].length;
      match = mentionRegex.exec(text);
    }

    if (lastIndex < text.length) {
      container.appendChild(document.createTextNode(text.slice(lastIndex)));
    }
  }

  function isOwnerUsername(username, role) {
    if (isOwnerLikeRole(role)) {
      return true;
    }
    const normalized = normalizeUsernameValue(username || '');
    return normalized === 'noah' || normalized === 'builder';
  }

  function isUnsetUsername(username) {
    const value = String(username || '').trim();
    const normalized = value.toLowerCase().replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim();
    return !value ||
      /^unset username(?: ?\d+)?$/.test(normalized) ||
      normalized === 'deleted account';
  }

  function createUsernameDisplayNode(username, options) {
    const config = options || {};
    const value = username || 'User';
    const wrapper = document.createElement('span');
    wrapper.className = 'chat-owner-badge';

    const label = document.createElement('span');
    label.className = 'chat-owner-badge-label';
    label.textContent = value;
    wrapper.appendChild(label);

    if (isUnsetUsername(value)) {
      wrapper.classList.add('is-unset');
    }

    if (isOwnerUsername(value, config.role)) {
      wrapper.classList.add('is-owner');

      const crown = document.createElement('span');
      crown.className = 'chat-owner-crown';
      crown.innerHTML = '<i class="fas fa-crown" aria-hidden="true"></i>';
      wrapper.appendChild(crown);

      if (config.tooltip) {
        const tooltip = document.createElement('span');
        tooltip.className = 'chat-owner-tooltip';
        tooltip.textContent = isOwnerLikeRole(config.role) && normalizeRoleValue(config.role) === 'owner'
          ? 'Owner'
          : 'Co-Owner';
        wrapper.appendChild(tooltip);
      }
    }

    return wrapper;
  }

  function setUsernameDisplay(element, username, options) {
    if (!element) {
      return;
    }

    element.textContent = '';
    element.appendChild(createUsernameDisplayNode(username, options));
  }

  function collapseWhitespace(value) {
    return String(value || '').replace(/\s+/g, ' ').trim();
  }

  function normalizeForChatFilter(value) {
    return String(value || '')
      .toLowerCase()
      .replace(/[@4]/g, 'a')
      .replace(/[!1|]/g, 'i')
      .replace(/3/g, 'e')
      .replace(/0/g, 'o')
      .replace(/5|\$/g, 's')
      .replace(/7/g, 't')
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function normalizeAggressiveFilterText(value) {
    return String(value || '')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '');
  }

  function evaluateChatMessageSafety(message) {
    const raw = String(message || '');
    const normalized = normalizeForChatFilter(raw);
    const compact = normalized.replace(/\s+/g, '');
    const aggressive = normalizeAggressiveFilterText(raw);

    if (!normalized) {
      return { ok: true };
    }

    if (/(.)\1{8,}/.test(compact)) {
      return { ok: false, reason: 'Please avoid spammy repeated letters.' };
    }

    if (/https?:\/\/|www\.|discord\.gg|\.gg\//i.test(raw)) {
      return { ok: false, reason: 'Links and invite codes are blocked in chat.' };
    }

    const blockedPatterns = [
      { pattern: /\b(kill|hurt|dox|swat)\s+(yourself|urself|you|him|her|them)\b/, reason: 'Threats and self-harm commands are blocked.' },
      { pattern: /\b(nigg|fagg|retard|coon|kike|spic|chink|tranny)\w*\b/, reason: 'Slurs and hateful language are blocked.' },
      { pattern: /\b(rape|molest|cp|childporn|loli|shota|nude\s*minor)\w*\b/, reason: 'Sexual abuse or minor sexual content is blocked.' },
      { pattern: /\b(fuck|shit|bitch|cunt|whore|slut|dick|cock|pussy)\w*\b/, reason: 'Use cleaner language in chat.' }
    ];

    for (let i = 0; i < blockedPatterns.length; i += 1) {
      if (blockedPatterns[i].pattern.test(normalized) || blockedPatterns[i].pattern.test(compact)) {
        return { ok: false, reason: blockedPatterns[i].reason };
      }
    }

    const compactSlurFragments = [
      'nigger',
      'nigga',
      'faggot',
      'retard',
      'kike',
      'spic',
      'chink',
      'tranny',
      'killyourself',
      'kys'
    ];
    for (let i = 0; i < compactSlurFragments.length; i += 1) {
      if (aggressive.indexOf(compactSlurFragments[i]) !== -1) {
        return { ok: false, reason: 'Slurs and hateful language are blocked.' };
      }
    }

    return { ok: true };
  }

  function setElementVisibility(element, visible) {
    if (!element) {
      return;
    }

    if (visible) {
      element.removeAttribute('hidden');
      element.setAttribute('aria-hidden', 'false');
      element.style.removeProperty('display');
    } else {
      element.setAttribute('hidden', 'hidden');
      element.setAttribute('aria-hidden', 'true');
      element.style.setProperty('display', 'none', 'important');
    }
  }

  function setFeedback(element, type, message) {
    if (!element) {
      return;
    }

    if (!message) {
      element.hidden = true;
      element.textContent = '';
      element.className = 'account-feedback';
      return;
    }

    element.hidden = false;
    element.textContent = message;
    element.className = 'account-feedback';

    if (type) {
      element.classList.add('is-' + type);
    }
  }

  function clearFeedbacks() {
    const elements = getElements();
    [
      elements.accountAuthFeedback,
      elements.accountAvatarFeedback,
      elements.accountUsernameFeedback,
      elements.accountPasswordFeedback,
      elements.accountDangerFeedback,
      elements.adminFeedback
    ].forEach(function (element) {
      setFeedback(element, '', '');
    });
  }

  function formatAbsoluteTime(isoValue) {
    if (!isoValue) {
      return '';
    }

    try {
      return new Intl.DateTimeFormat('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        month: 'short',
        day: 'numeric'
      }).format(new Date(isoValue));
    } catch (error) {
      return '';
    }
  }

  function formatListPreviewTime(isoValue) {
    if (!isoValue) {
      return '';
    }

    try {
      return new Intl.DateTimeFormat('en-US', {
        hour: 'numeric',
        minute: '2-digit'
      }).format(new Date(isoValue));
    } catch (error) {
      return '';
    }
  }

  function formatRelativeDay(isoValue) {
    if (!isoValue) {
      return 'Offline';
    }

    const target = new Date(isoValue).getTime();
    if (!Number.isFinite(target)) {
      return 'Offline';
    }

    const diff = nowMs() - target;
    if (diff < 5 * 60 * 1000) {
      return 'Online now';
    }
    if (diff < 24 * 60 * 60 * 1000) {
      return 'Seen today';
    }
    if (diff < 48 * 60 * 60 * 1000) {
      return 'Seen yesterday';
    }

    return 'Seen ' + Math.max(2, Math.floor(diff / (24 * 60 * 60 * 1000))) + 'd ago';
  }

  function formatDurationUntil(isoValue) {
    if (!isoValue) {
      return 'Now';
    }

    const target = new Date(isoValue).getTime();
    if (!Number.isFinite(target)) {
      return 'Now';
    }

    const diff = target - nowMs();
    if (diff <= 0) {
      return 'Now';
    }

    const totalSeconds = Math.ceil(diff / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);

    if (days > 0) {
      return days + 'd ' + hours + 'h';
    }

    if (hours > 0) {
      return hours + 'h ' + minutes + 'm';
    }

    return Math.max(1, minutes) + 'm';
  }

  function getWarningStatusText(warnings) {
    const warningCount = Math.max(0, Number(warnings || 0));
    if (!warningCount) {
      return '';
    }

    const toTimeout = Math.max(0, 2 - warningCount);
    const toBan = Math.max(0, 3 - warningCount);
    return warningCount + ' warning' + (warningCount === 1 ? '' : 's') +
      ' active. ' + toTimeout + ' until timeout, ' + toBan + ' until ban.';
  }

  function buildCollectionFileUrl(collectionName, recordId, fileName, versionKey) {
    if (!collectionName || !recordId || !fileName) {
      return '';
    }

    const baseUrl = '/api/files/' + collectionName + '/' + recordId + '/' + encodeURIComponent(fileName);
    const normalizedVersion = String(versionKey || '').trim();
    return normalizedVersion ? baseUrl + '?v=' + encodeURIComponent(normalizedVersion) : baseUrl;
  }

  function getAvatarFallbackText(label) {
    const value = String(label || '').trim();
    return value ? value.charAt(0).toUpperCase() : '?';
  }

  function setAvatarImageSource(container, fallback, image, label, url) {
    if (fallback) {
      fallback.textContent = getAvatarFallbackText(label);
    }

    if (!image) {
      return;
    }

    image.alt = (label || 'User') + ' avatar';
    image.loading = 'eager';
    image.decoding = 'async';
    image.style.display = 'none';
    if (container) {
      container.classList.remove('has-image');
    }
    const applyLoadedState = function () {
      if (container) {
        container.classList.add('has-image');
      }
      image.style.display = 'block';
    };
    image.onload = function () {
      applyLoadedState();
    };
    image.onerror = function () {
      image.onload = null;
      image.onerror = null;
      image.removeAttribute('src');
      image.style.display = 'none';
      if (container) {
        container.classList.remove('has-image');
      }
    };

    if (url) {
      if (image.getAttribute('src') === url && image.complete && image.naturalWidth > 0) {
        applyLoadedState();
        return;
      }
      image.src = url;
      if (image.complete && image.naturalWidth > 0) {
        applyLoadedState();
      }
      return;
    }

    image.removeAttribute('src');
    image.style.display = 'none';
    if (container) {
      container.classList.remove('has-image');
    }
  }

  function createInlineAvatarElement(label, url, imageClass, fallbackClass) {
    if (!url) {
      const fallback = document.createElement('div');
      fallback.className = imageClass + ' ' + fallbackClass;
      fallback.textContent = getAvatarFallbackText(label);
      return fallback;
    }

    const image = document.createElement('img');
    image.className = imageClass;
    image.alt = (label || 'User') + ' avatar';
    image.loading = 'eager';
    image.decoding = 'async';
    image.style.display = 'none';
    const applyLoadedState = function () {
      image.style.display = 'block';
    };
    image.addEventListener('load', function () {
      applyLoadedState();
    }, { once: true });
    image.addEventListener('error', function () {
      const fallback = document.createElement('div');
      fallback.className = imageClass + ' ' + fallbackClass;
      fallback.textContent = getAvatarFallbackText(label);
      image.replaceWith(fallback);
    }, { once: true });
    image.src = url;
    if (image.complete && image.naturalWidth > 0) {
      applyLoadedState();
    }
    return image;
  }

  function createChatMessageAvatarElement(label, url) {
    const wrapper = document.createElement('div');
    wrapper.className = 'chat-avatar-shell';

    const fallback = document.createElement('div');
    fallback.className = 'chat-avatar-fallback';

    const image = document.createElement('img');
    image.className = 'chat-avatar';

    wrapper.appendChild(fallback);
    wrapper.appendChild(image);
    setAvatarImageSource(wrapper, fallback, image, label, url);

    return wrapper;
  }

  function buildUserAvatarUrl(user) {
    if (!user) {
      return '';
    }

    if (user.avatar && user.id) {
      return buildCollectionFileUrl('users', user.id, user.avatar, user.updated || user.updatedAt || user.avatarUpdatedAt || user.avatar);
    }

    if (user.avatarUrl) {
      return user.avatarUrl;
    }

    return '';
  }

  function buildRoomAvatarUrl(room) {
    if (!room) {
      return '';
    }

    if (room.avatar && room.id) {
      return buildCollectionFileUrl('chat_rooms', room.id, room.avatar, room.updated || room.updatedAt || room.avatarUpdatedAt || room.avatar);
    }

    if (room.avatarUrl) {
      return room.avatarUrl;
    }

    return '';
  }

  function getChatMessageImageUrl(message) {
    if (!message) {
      return '';
    }

    if (message.imageUrl) {
      return message.imageUrl;
    }

    return buildCollectionFileUrl('chat_room_messages', message.id, message.imageAttachment);
  }

  function getMessagePreviewText(message) {
    if (!message) {
      return '';
    }

    const body = String(message.body || '').trim();
    if (body) {
      return body;
    }

    return getChatMessageImageUrl(message) ? 'Sent an image' : '';
  }

  function findKnownUserSummary(userId, username) {
    const normalizedId = String(userId || '').trim();
    const normalizedUsername = normalizeUsernameValue(username || '');
    const data = getBootstrapData();
    const candidates = []
      .concat(state.session && state.session.user ? [state.session.user] : [])
      .concat(data.mentionDirectory || [])
      .concat(data.friends || [])
      .concat(data.blockedUsers || [])
      .concat((data.incomingRequests || []).map(function (request) { return request.user; }))
      .concat((data.outgoingRequests || []).map(function (request) { return request.user; }))
      .concat((data.dmRooms || []).map(function (room) { return room && room.peer ? room.peer : null; }))
      .concat(state.activeRoom && Array.isArray(state.activeRoom.members) ? state.activeRoom.members : []);

    let bestMatch = null;
    let bestScore = -1;

    for (let i = 0; i < candidates.length; i += 1) {
      const candidate = candidates[i];
      if (!candidate) {
        continue;
      }

      const idMatch = normalizedId && candidate.id === normalizedId;
      const usernameMatch = normalizedUsername && normalizeUsernameValue(candidate.username || '') === normalizedUsername;
      if (!idMatch && !usernameMatch) {
        continue;
      }

      let score = 0;
      if (idMatch) score += 10;
      if (usernameMatch) score += 6;
      if (candidate.avatarUrl) score += 3;
      if (candidate.avatar) score += 2;
      if (state.activeRoom && Array.isArray(state.activeRoom.members) && state.activeRoom.members.indexOf(candidate) !== -1) {
        score += 2;
      }

      if (score > bestScore) {
        bestScore = score;
        bestMatch = candidate;
      }
    }

    return bestMatch;
  }

  function clearMentionSuggestions() {
    if (state.mentionLookupHandle) {
      clearTimeout(state.mentionLookupHandle);
      state.mentionLookupHandle = null;
    }

    state.mentionSuggestions = [];
    state.mentionSelectedIndex = 0;
    state.mentionQuery = '';
    state.mentionAnchorIndex = -1;

    const elements = getElements();
    setElementVisibility(elements.chatMentionMenu, false);
    if (elements.chatMentionMenu) {
      elements.chatMentionMenu.innerHTML = '';
    }
  }

  function getActiveMentionState() {
    const elements = getElements();
    if (!elements.chatMessageInput) {
      return null;
    }

    const input = elements.chatMessageInput;
    const caret = typeof input.selectionStart === 'number'
      ? input.selectionStart
      : String(input.value || '').length;
    const beforeCaret = String(input.value || '').slice(0, caret);
    const match = beforeCaret.match(/(^|[\s(])@([a-z0-9_]*)$/i);

    if (!match) {
      return null;
    }

    return {
      prefix: normalizeUsernameValue(match[2] || ''),
      caret: caret,
      start: caret - (match[2] || '').length - 1
    };
  }

  function renderMentionSuggestions() {
    const elements = getElements();
    if (!elements.chatMentionMenu) {
      return;
    }

    elements.chatMentionMenu.innerHTML = '';

    if (!state.mentionSuggestions.length) {
      setElementVisibility(elements.chatMentionMenu, false);
      return;
    }

    state.mentionSuggestions.forEach(function (entry, index) {
      const button = document.createElement('button');
      button.className = 'chat-mention-option' + (index === state.mentionSelectedIndex ? ' is-active' : '');
      button.type = 'button';
      button.dataset.mentionUsername = entry.username || '';

      const avatarUrl = buildUserAvatarUrl(entry);
      const avatarHolder = createInlineAvatarElement(
        entry.username || 'User',
        avatarUrl,
        'chat-mention-avatar',
        'chat-mention-avatar-fallback'
      );

      const label = document.createElement('span');
      label.className = 'chat-mention-label';
      setUsernameDisplay(label, entry.username || 'user', { tooltip: false });

      button.appendChild(avatarHolder);
      button.appendChild(label);
      elements.chatMentionMenu.appendChild(button);
    });

    setElementVisibility(elements.chatMentionMenu, true);
  }

  function applyMentionSuggestion(username) {
    const elements = getElements();
    if (!elements.chatMessageInput || !username) {
      return;
    }

    const mentionState = getActiveMentionState();
    if (!mentionState) {
      clearMentionSuggestions();
      return;
    }

    const input = elements.chatMessageInput;
    const value = String(input.value || '');
    const insertion = '@' + normalizeUsernameValue(username) + ' ';
    input.value = value.slice(0, mentionState.start) + insertion + value.slice(mentionState.caret);

    const nextCaret = mentionState.start + insertion.length;
    input.focus();
    input.setSelectionRange(nextCaret, nextCaret);
    clearMentionSuggestions();
  }

  function collectMentionCandidates(prefix) {
    const requestedPrefix = prefix || '';
    const data = getBootstrapData();
    const byUsername = new Map();

    function addCandidate(candidate) {
      if (!candidate) {
        return;
      }

      const username = normalizeUsernameValue(candidate.username || candidate.fromUsername || candidate.toUsername || candidate.authorUsername || '');
      if (!username) {
        return;
      }

      if (requestedPrefix && username.indexOf(requestedPrefix) !== 0) {
        return;
      }

      if (byUsername.has(username)) {
        return;
      }

      byUsername.set(username, {
        id: candidate.id || candidate.userId || candidate.fromUserId || candidate.toUserId || candidate.authorId || '',
        username: username,
        avatar: candidate.avatar || candidate.avatarSnapshot || candidate.fromAvatar || candidate.toAvatar || candidate.authorAvatar || '',
        avatarUrl: candidate.avatarUrl || ''
      });
    }

    if (Array.isArray(data.mentionDirectory) && data.mentionDirectory.length) {
      data.mentionDirectory.forEach(addCandidate);
    } else {
      (data.friends || []).forEach(addCandidate);
      (data.blockedUsers || []).forEach(addCandidate);
      (data.incomingRequests || []).forEach(addCandidate);
      (data.outgoingRequests || []).forEach(addCandidate);
      (data.dmRooms || []).forEach(function (room) {
        if (room && room.peer) {
          addCandidate(room.peer);
        }
      });

      if (state.activeRoom && Array.isArray(state.activeRoom.members)) {
        state.activeRoom.members.forEach(addCandidate);
      }

      if (state.activeRoom && Array.isArray(state.activeRoom.messages)) {
        state.activeRoom.messages.forEach(addCandidate);
      }
    }

    return Array.from(byUsername.values())
      .sort(function (left, right) {
        return left.username.localeCompare(right.username);
      })
      .slice(0, requestedPrefix ? 5 : 10);
  }

  function updateMentionSuggestions() {
    const mentionState = getActiveMentionState();
    if (!mentionState) {
      clearMentionSuggestions();
      return;
    }

    state.mentionQuery = mentionState.prefix || '';
    state.mentionAnchorIndex = mentionState.start;

    if (state.mentionLookupHandle) {
      clearTimeout(state.mentionLookupHandle);
    }

    state.mentionLookupHandle = window.setTimeout(function () {
      state.mentionLookupHandle = null;
      state.mentionSuggestions = collectMentionCandidates(mentionState.prefix || '');
      state.mentionSelectedIndex = 0;
      renderMentionSuggestions();
    }, 90);
  }

  function getReplyPreviewText(message) {
    if (!message) {
      return '';
    }

    if (message.replyTo && typeof message.replyTo === 'object') {
      const storedBody = String(message.replyTo.body || '').trim();
      if (storedBody) {
        return storedBody;
      }
      return message.replyTo.hasImage ? 'Sent an image' : '';
    }

    return getMessagePreviewText(message);
  }

  function clearPendingReply(shouldFocus) {
    state.pendingReply = null;
    renderChatComposerAttachmentState();

    if (shouldFocus) {
      const elements = getElements();
      if (elements.chatMessageInput) {
        elements.chatMessageInput.focus();
      }
    }
  }

  function setPendingReply(message) {
    if (!message || !message.id) {
      return;
    }

    state.pendingReply = {
      messageId: message.id,
      authorUsername: message.authorUsername || 'User',
      body: getMessagePreviewText(message),
      hasImage: !!getChatMessageImageUrl(message)
    };

    renderChatComposerAttachmentState();

    const elements = getElements();
    if (elements.chatMessageInput) {
      elements.chatMessageInput.focus();
    }
  }

  function clearPendingChatImage() {
    const elements = getElements();
    state.pendingChatImageFile = null;

    if (elements.chatImageInput) {
      elements.chatImageInput.value = '';
    }

    renderChatComposerAttachmentState();
  }

  function canAttachImagesToRoom(room) {
    return !!(room && room.type !== 'global');
  }

  function canAttachImagesToActiveRoom() {
    return canAttachImagesToRoom(state.activeRoom && state.activeRoom.room ? state.activeRoom.room : null);
  }

  function renderChatComposerAttachmentState() {
    const elements = getElements();
    const room = state.activeRoom && state.activeRoom.room ? state.activeRoom.room : null;
    const canAttachImage = canAttachImagesToRoom(room);
    const hasReply = !!(state.pendingReply && state.pendingReply.messageId);
    const hasImage = !!state.pendingChatImageFile;

    setElementVisibility(elements.chatImageButton, canAttachImage);
    setElementVisibility(elements.chatReplyChip, hasReply);
    setElementVisibility(elements.chatAttachmentChip, canAttachImage && hasImage);
    setElementVisibility(elements.chatComposerMeta, hasReply || (canAttachImage && hasImage));

    if (elements.chatImageButton) {
      elements.chatImageButton.disabled = !canAttachImage;
      elements.chatImageButton.title = canAttachImage ? 'Attach image' : 'Global chat does not allow image uploads';
    }

    if (elements.chatAttachmentName) {
      elements.chatAttachmentName.textContent = state.pendingChatImageFile ? state.pendingChatImageFile.name : 'Image ready';
    }

    if (elements.chatReplyAuthor) {
      elements.chatReplyAuthor.textContent = hasReply ? ('Replying to ' + (state.pendingReply.authorUsername || 'User')) : 'Replying';
    }

    if (elements.chatReplyPreview) {
      const preview = hasReply
        ? (String(state.pendingReply.body || '').trim() || (state.pendingReply.hasImage ? 'Sent an image' : 'Original message'))
        : 'Message preview';
      elements.chatReplyPreview.textContent = preview;
    }

    if (!canAttachImage && state.pendingChatImageFile) {
      state.pendingChatImageFile = null;
      if (elements.chatImageInput) {
        elements.chatImageInput.value = '';
      }
      setElementVisibility(elements.chatAttachmentChip, false);
      setElementVisibility(elements.chatComposerMeta, hasReply);
    }
  }

  function getModerationSnapshot() {
    const moderation = state.session && state.session.moderation ? state.session.moderation : null;
    if (state.accountLock && state.accountLock.active) {
      return {
        warnings: 0,
        muteUntil: null,
        banUntil: state.accountLock.reason === 'banned' ? (state.accountLock.until || null) : null,
        isBanned: true,
        isLocked: true,
        isDeleted: state.accountLock.reason === 'deleted',
        warningExpirations: []
      };
    }

    if (!moderation) {
      return {
        warnings: 0,
        muteUntil: null,
        banUntil: null,
        isBanned: false,
        isLocked: false,
        isDeleted: false,
        warningExpirations: []
      };
    }

    return {
      warnings: Number(moderation.activeWarnings || 0),
      muteUntil: moderation.muteUntil || null,
      banUntil: moderation.banUntil || null,
      isBanned: !!moderation.isBanned,
      isLocked: !!moderation.isBanned,
      isDeleted: false,
      warningExpirations: Array.isArray(moderation.warningsExpireAt) ? moderation.warningsExpireAt : []
    };
  }

  function canUseAccountActions() {
    const moderation = getModerationSnapshot();
    return !moderation.isBanned && !(state.accountLock && state.accountLock.active);
  }

  function getSessionUser() {
    return state.session && state.session.user ? state.session.user : null;
  }

  function getSessionUsername() {
    const user = getSessionUser();
    return user ? String(user.username || '') : '';
  }

  function isCurrentUsernameUnset() {
    return isUnsetUsername(getSessionUsername());
  }

  function isAccountLocked() {
    const moderation = getModerationSnapshot();
    return !!(state.accountLock && state.accountLock.active) || !!moderation.isBanned;
  }

  function exposeAccountLockState() {
    window.__noahsAccountLocked = function () {
      return isAccountLocked();
    };
  }

  function clearAccountLock() {
    state.accountLock = {
      active: false,
      reason: '',
      detail: ''
    };
    try {
      localStorage.removeItem('noahsAccountLock');
    } catch (error) {
    }
    exposeAccountLockState();
  }

  function buildLockedSession(reason, detail, until) {
    const authModel = pb && pb.authStore && pb.authStore.model ? pb.authStore.model : {};
    const authUser = state.session && state.session.user ? state.session.user : {};
    const user = Object.assign({}, authModel || {}, authUser || {}, {
      id: (authUser && authUser.id) || (authModel && authModel.id) || 'deleted-account',
      username: reason === 'deleted' ? 'DELETED ACCOUNT' : ((authUser && authUser.username) || (authModel && authModel.username) || 'DELETED ACCOUNT'),
      role: (authUser && authUser.role) || (authModel && authModel.role) || 'user'
    });

    return {
      user: user,
      account: {
        usernameChangeAvailableAt: null
      },
      moderation: {
        activeWarnings: 0,
        muteUntil: null,
        banUntil: until || null,
        isBanned: true,
        warningsExpireAt: []
      },
      locked: true,
      lockReason: reason,
      lockDetail: detail || ''
    };
  }

  function markAccountLocked(reason, detail, until) {
    state.accountLock = {
      active: true,
      reason: reason || 'locked',
      detail: detail || '',
      until: until || null
    };
    state.session = buildLockedSession(state.accountLock.reason, state.accountLock.detail, state.accountLock.until);
    state.bootstrap = null;
    state.activeRoom = null;
    state.activeRoomId = '';
    state.transientDmRoom = null;
    state.adminReports = [];
    state.modsDirectory = [];
    state.lastRenderedMessagesKey = '';
    try {
      localStorage.setItem('noahsAccountLock', JSON.stringify(state.accountLock));
    } catch (error) {
    }
    exposeAccountLockState();
  }

  function restoreAccountLock() {
    exposeAccountLockState();
    try {
      const stored = JSON.parse(localStorage.getItem('noahsAccountLock') || 'null');
      if (stored && stored.active) {
        markAccountLocked(stored.reason || 'locked', stored.detail || '', stored.until || null);
      }
    } catch (error) {
    }
  }

  function stopActiveAudio() {
    if (state.activeAudioStopHandle) {
      clearTimeout(state.activeAudioStopHandle);
      state.activeAudioStopHandle = null;
    }

    if (state.activeAudio) {
      try {
        state.activeAudio.pause();
      } catch (error) {
      }
      state.activeAudio = null;
    }
  }

  function playAdminSound(url, options) {
    if (!url) {
      return;
    }

    const settings = options || {};
    stopActiveAudio();
    const audio = new Audio(url);
    audio.preload = 'auto';
    audio.loop = !!settings.loop;
    state.activeAudio = audio;

    audio.play().catch(function () {
      state.activeAudio = null;
    });

    if (!audio.loop) {
      audio.addEventListener('ended', function () {
        if (state.activeAudio === audio) {
          state.activeAudio = null;
        }
        if (state.activeAudioStopHandle) {
          clearTimeout(state.activeAudioStopHandle);
          state.activeAudioStopHandle = null;
        }
      }, { once: true });
    }

    if (settings.maxDurationMs && Number.isFinite(settings.maxDurationMs) && settings.maxDurationMs > 0) {
      state.activeAudioStopHandle = window.setTimeout(function () {
        if (state.activeAudio === audio) {
          stopActiveAudio();
        }
      }, settings.maxDurationMs);
    }
  }

  function prepareSiteOverlayLayer() {
    const elements = getElements();
    [
      elements.trollMediaOverlay,
      elements.siteFlashbangOverlay,
      elements.siteBustOverlay,
      elements.siteNukeOverlay
    ].forEach(function (overlay) {
      if (overlay && overlay.parentElement === document.body) {
        document.body.appendChild(overlay);
      }
    });

    document.querySelectorAll('.game-frame.fullscreen').forEach(function (frame) {
      frame.classList.remove('fullscreen');
    });

    const exitFullscreen = document.exitFullscreen ||
      document.webkitExitFullscreen ||
      document.msExitFullscreen ||
      document.mozCancelFullScreen;

    if (exitFullscreen && (
      document.fullscreenElement ||
      document.webkitFullscreenElement ||
      document.msFullscreenElement ||
      document.mozFullScreenElement
    )) {
      try {
        const result = exitFullscreen.call(document);
        if (result && typeof result.catch === 'function') {
          result.catch(function () { });
        }
      } catch (error) {
      }
    }
  }

  function triggerBarrelRoll() {
    const elements = getElements();
    if (!elements.mainContainer) {
      return;
    }

    elements.mainContainer.classList.remove('site-troll-roll');
    void elements.mainContainer.offsetWidth;
    elements.mainContainer.classList.add('site-troll-roll');

    window.setTimeout(function () {
      elements.mainContainer.classList.remove('site-troll-roll');
    }, 1300);
  }

  function hideBroadcastToast(immediate) {
    const elements = getElements();

    if (state.broadcastToastHandle) {
      clearTimeout(state.broadcastToastHandle);
      state.broadcastToastHandle = null;
    }

    if (state.broadcastHideHandle) {
      clearTimeout(state.broadcastHideHandle);
      state.broadcastHideHandle = null;
    }

    if (!elements.siteBroadcastBanner) {
      return;
    }

    elements.siteBroadcastBanner.classList.remove('visible');

    if (immediate) {
      elements.siteBroadcastBanner.hidden = true;
      return;
    }

    state.broadcastHideHandle = window.setTimeout(function () {
      elements.siteBroadcastBanner.hidden = true;
      state.broadcastHideHandle = null;
    }, 260);
  }

  function showBroadcastToast(message, durationMs) {
    const elements = getElements();
    if (!elements.siteBroadcastBanner || !message) {
      return;
    }

    if (state.broadcastToastHandle) {
      clearTimeout(state.broadcastToastHandle);
      state.broadcastToastHandle = null;
    }

    if (state.broadcastHideHandle) {
      clearTimeout(state.broadcastHideHandle);
      state.broadcastHideHandle = null;
    }

    elements.siteBroadcastBanner.textContent = message;
    elements.siteBroadcastBanner.hidden = false;
    window.requestAnimationFrame(function () {
      elements.siteBroadcastBanner.classList.add('visible');
    });

    state.broadcastToastHandle = window.setTimeout(function () {
      hideBroadcastToast(false);
    }, durationMs || 5200);
  }

  function hideMentionToast(immediate) {
    const elements = getElements();

    if (state.mentionToastHandle) {
      clearTimeout(state.mentionToastHandle);
      state.mentionToastHandle = null;
    }

    if (state.mentionHideHandle) {
      clearTimeout(state.mentionHideHandle);
      state.mentionHideHandle = null;
    }

    if (!elements.siteMentionToast) {
      return;
    }

    elements.siteMentionToast.classList.remove('visible');

    if (immediate) {
      elements.siteMentionToast.hidden = true;
      return;
    }

    state.mentionHideHandle = window.setTimeout(function () {
      elements.siteMentionToast.hidden = true;
      state.mentionHideHandle = null;
      if (state.mentionToastQueue.length) {
        const nextNotification = state.mentionToastQueue.shift();
        showMentionToast(nextNotification);
      }
    }, 260);
  }

  function pruneMentionToastTracking(now) {
    Object.keys(state.mentionToastSeenKeys).forEach(function (key) {
      if (now - state.mentionToastSeenKeys[key] > 90000) {
        delete state.mentionToastSeenKeys[key];
      }
    });

    Object.keys(state.mentionToastCooldowns).forEach(function (key) {
      if (now - state.mentionToastCooldowns[key] > 12000) {
        delete state.mentionToastCooldowns[key];
      }
    });
  }

  function buildMentionToastKey(notification) {
    if (!notification) {
      return '';
    }

    return [
      notification.id || '',
      notification.messageId || '',
      notification.roomId || '',
      notification.actorId || '',
      notification.actorUsername || '',
      formatMentionNotificationText(notification)
    ].join('|');
  }

  function reserveMentionToastNotification(notification) {
    if (!notification || !formatMentionNotificationText(notification)) {
      return false;
    }

    const now = Date.now();
    pruneMentionToastTracking(now);

    const exactKey = buildMentionToastKey(notification);
    const cooldownKey = [
      notification.roomId || '',
      notification.actorId || notification.actorUsername || ''
    ].join('|');

    if (exactKey && state.mentionToastSeenKeys[exactKey]) {
      return false;
    }

    if (cooldownKey && state.mentionToastCooldowns[cooldownKey] && (now - state.mentionToastCooldowns[cooldownKey]) < 8000) {
      return false;
    }

    if (exactKey) {
      state.mentionToastSeenKeys[exactKey] = now;
    }
    if (cooldownKey) {
      state.mentionToastCooldowns[cooldownKey] = now;
    }

    return true;
  }

  function showMentionToast(notification) {
    const elements = getElements();
    if (!elements.siteMentionToast || !notification) {
      return;
    }

    if (!elements.siteMentionToast.hidden && state.mentionToastHandle) {
      state.mentionToastQueue.push(notification);
      return;
    }

    if (state.mentionToastHandle) {
      clearTimeout(state.mentionToastHandle);
      state.mentionToastHandle = null;
    }

    if (state.mentionHideHandle) {
      clearTimeout(state.mentionHideHandle);
      state.mentionHideHandle = null;
    }

    setAvatarImageSource(
      elements.siteMentionToastAvatar,
      elements.siteMentionToastAvatarFallback,
      elements.siteMentionToastAvatarImage,
      notification.actorUsername || 'User',
      notification.actorAvatarUrl || ''
    );

    if (elements.siteMentionToastTitle) {
      elements.siteMentionToastTitle.textContent = 'New mention';
    }

    if (elements.siteMentionToastBody) {
      elements.siteMentionToastBody.textContent = formatMentionNotificationText(notification);
    }

    state.mentionToastRoomId = notification.roomId || '';
    state.mentionToastRoomType = notification.roomType || '';

    elements.siteMentionToast.hidden = false;
    window.requestAnimationFrame(function () {
      elements.siteMentionToast.classList.add('visible');
    });

    state.mentionToastHandle = window.setTimeout(function () {
      state.mentionToastHandle = null;
      hideMentionToast(false);
    }, 5000);
  }

  function formatMentionNotificationText(notification) {
    if (!notification || !notification.actorUsername) {
      return '';
    }

    const roomType = String(notification.roomType || '').toLowerCase();
    let roomLabel = notification.roomName || 'chat';

    if (roomType === 'global') {
      roomLabel = 'Global Chat';
    } else if (roomType === 'dm') {
      roomLabel = 'Direct Message';
    } else if (!roomLabel) {
      roomLabel = 'group chat';
    }

    return notification.actorUsername + ' mentioned you in ' + roomLabel + '.';
  }

  function consumeMentionNotifications(notifications) {
    if (!Array.isArray(notifications) || !notifications.length) {
      return;
    }

    notifications.filter(function (notification) {
      return reserveMentionToastNotification(notification);
    }).slice(0, 3).forEach(function (notification, index) {
      window.setTimeout(function () {
        showMentionToast(notification);
      }, index * 5300);
    });
  }

  function hideTrollMedia(immediate) {
    const elements = getElements();

    if (state.trollMediaHandle) {
      clearTimeout(state.trollMediaHandle);
      state.trollMediaHandle = null;
    }

    if (state.trollMediaHideHandle) {
      clearTimeout(state.trollMediaHideHandle);
      state.trollMediaHideHandle = null;
    }

    if (!elements.trollMediaOverlay || !elements.trollMediaImage) {
      return;
    }

    elements.trollMediaOverlay.classList.remove('visible');

    if (immediate) {
      elements.trollMediaOverlay.hidden = true;
      elements.trollMediaImage.removeAttribute('src');
      return;
    }

    state.trollMediaHideHandle = window.setTimeout(function () {
      elements.trollMediaOverlay.hidden = true;
      elements.trollMediaImage.removeAttribute('src');
      state.trollMediaHideHandle = null;
    }, 260);
  }

  function showTrollMedia(url) {
    const elements = getElements();
    if (!elements.trollMediaOverlay || !elements.trollMediaImage || !url) {
      return;
    }

    prepareSiteOverlayLayer();

    if (state.trollMediaHandle) {
      clearTimeout(state.trollMediaHandle);
      state.trollMediaHandle = null;
    }

    if (state.trollMediaHideHandle) {
      clearTimeout(state.trollMediaHideHandle);
      state.trollMediaHideHandle = null;
    }

    elements.trollMediaImage.src = url;
    elements.trollMediaOverlay.hidden = false;
    window.requestAnimationFrame(function () {
      elements.trollMediaOverlay.classList.add('visible');
    });

    state.trollMediaHandle = window.setTimeout(function () {
      hideTrollMedia(false);
    }, 6000);
  }

  function hideFlashbangOverlay(immediate) {
    const elements = getElements();

    if (state.flashbangHandle) {
      clearTimeout(state.flashbangHandle);
      state.flashbangHandle = null;
    }

    if (state.flashbangFadeHandle) {
      clearTimeout(state.flashbangFadeHandle);
      state.flashbangFadeHandle = null;
    }

    if (!elements.siteFlashbangOverlay) {
      return;
    }

    if (immediate) {
      elements.siteFlashbangOverlay.classList.remove('visible', 'is-fading');
      elements.siteFlashbangOverlay.style.transition = '';
      elements.siteFlashbangOverlay.hidden = true;
      return;
    }

    state.flashbangFadeHandle = window.setTimeout(function () {
      elements.siteFlashbangOverlay.hidden = true;
      elements.siteFlashbangOverlay.classList.remove('visible', 'is-fading');
      elements.siteFlashbangOverlay.style.transition = '';
      state.flashbangFadeHandle = null;
    }, 2450);
  }

  function startFlashbangSequence(triggeredAt, nonce) {
    const elements = getElements();
    if (!elements.siteFlashbangOverlay || !nonce) {
      return;
    }

    prepareSiteOverlayLayer();

    if (state.activeFlashbangNonce === nonce && (state.flashbangHandle || state.flashbangFadeHandle)) {
      return;
    }

    hideFlashbangOverlay(true);
    state.activeFlashbangNonce = nonce;
    playAdminSound('/Flash%20Bang.mp3');

    elements.siteFlashbangOverlay.hidden = false;
    elements.siteFlashbangOverlay.style.transition = 'none';
    window.requestAnimationFrame(function () {
      elements.siteFlashbangOverlay.classList.remove('is-fading');
      elements.siteFlashbangOverlay.classList.add('visible');
      void elements.siteFlashbangOverlay.offsetWidth;
      elements.siteFlashbangOverlay.style.transition = '';
    });

    state.flashbangHandle = window.setTimeout(function () {
      elements.siteFlashbangOverlay.classList.remove('visible');
      elements.siteFlashbangOverlay.classList.add('is-fading');
      state.flashbangHandle = null;
      hideFlashbangOverlay(false);
    }, Math.max(0, 5000 - Math.min(5000, Math.max(0, nowMs() - (Date.parse(triggeredAt || '') || nowMs())))));
  }

  function hideBustOverlay(immediate) {
    const elements = getElements();

    if (state.bustHandle) {
      clearTimeout(state.bustHandle);
      state.bustHandle = null;
    }

    if (state.bustFadeHandle) {
      clearTimeout(state.bustFadeHandle);
      state.bustFadeHandle = null;
    }

    if (!elements.siteBustOverlay) {
      return;
    }

    if (immediate) {
      elements.siteBustOverlay.classList.remove('visible', 'is-fading');
      elements.siteBustOverlay.hidden = true;
      stopActiveAudio();
      return;
    }

    state.bustFadeHandle = window.setTimeout(function () {
      elements.siteBustOverlay.hidden = true;
      elements.siteBustOverlay.classList.remove('visible', 'is-fading');
      stopActiveAudio();
      state.bustFadeHandle = null;
    }, 900);
  }

  function startBustSequence(triggeredAt, nonce) {
    const elements = getElements();
    if (!elements.siteBustOverlay || !elements.siteBustImage || !nonce) {
      return;
    }

    prepareSiteOverlayLayer();

    if (state.activeBustNonce === nonce && (state.bustHandle || state.bustFadeHandle)) {
      return;
    }

    hideBustOverlay(true);
    state.activeBustNonce = nonce;
    playAdminSound('/splooge-made-with-Voicemod.mp3', { loop: true });
    elements.siteBustOverlay.hidden = false;
    elements.siteBustImage.src = 'bust.gif?v=' + encodeURIComponent(nonce);

    window.requestAnimationFrame(function () {
      elements.siteBustOverlay.classList.remove('is-fading');
      elements.siteBustOverlay.classList.add('visible');
    });

    state.bustHandle = window.setTimeout(function () {
      elements.siteBustOverlay.classList.remove('visible');
      elements.siteBustOverlay.classList.add('is-fading');
      state.bustHandle = null;
      hideBustOverlay(false);
    }, Math.max(0, 7000 - Math.min(7000, Math.max(0, nowMs() - (Date.parse(triggeredAt || '') || nowMs())))));
  }

  function hideNukeOverlay(immediate) {
    const elements = getElements();

    if (state.nukeSequenceHandle) {
      clearInterval(state.nukeSequenceHandle);
      state.nukeSequenceHandle = null;
    }

    if (state.nukeHideHandle) {
      clearTimeout(state.nukeHideHandle);
      state.nukeHideHandle = null;
    }

    state.activeNukeNonce = '';

    if (!elements.siteNukeOverlay) {
      return;
    }

    elements.siteNukeOverlay.classList.remove('visible', 'is-flash-phase');
    elements.siteNukeOverlay.style.background = '#020202';
    elements.siteNukeOverlay.style.color = '#ff5e5e';

    if (elements.siteNukeTitle) {
      elements.siteNukeTitle.textContent = 'If you have epilepsy or are photosensitive, leave the page now.';
    }

    if (elements.siteNukeTimer) {
      elements.siteNukeTimer.textContent = '5.00';
    }

    if (elements.siteNukeNote) {
      elements.siteNukeNote.textContent = 'Sitewide admin takeover in progress.';
    }

    if (immediate) {
      elements.siteNukeOverlay.hidden = true;
      return;
    }

    state.nukeHideHandle = window.setTimeout(function () {
      elements.siteNukeOverlay.hidden = true;
      state.nukeHideHandle = null;
    }, 220);
  }

  function startNukeSequence(triggeredAt, nonce) {
    const elements = getElements();
    if (!elements.siteNukeOverlay || !elements.siteNukeTitle || !elements.siteNukeTimer || !elements.siteNukeNote || !nonce) {
      return;
    }

    prepareSiteOverlayLayer();

    if (state.activeNukeNonce === nonce && state.nukeSequenceHandle) {
      return;
    }

    hideNukeOverlay(true);
    state.activeNukeNonce = nonce;
    playAdminSound('/freesound_community-n-o-t-i-f-y-c-a-r-69566.mp3', { maxDurationMs: 11000 });

    const triggerMs = Date.parse(triggeredAt || '') || nowMs();
    const countdownEndMs = triggerMs + 5000;
    const flashEndMs = countdownEndMs + 6000;
    const flashPalette = ['#4f0000', '#040404', '#ffffff', '#5e0000', '#050505', '#ffffff'];

    elements.siteNukeOverlay.hidden = false;

    const render = function () {
      const currentMs = nowMs();

      if (currentMs < countdownEndMs) {
        const secondsLeft = Math.max(0, (countdownEndMs - currentMs) / 1000);
        elements.siteNukeOverlay.classList.add('visible');
        elements.siteNukeOverlay.classList.remove('is-flash-phase');
        elements.siteNukeOverlay.style.background = '#020202';
        elements.siteNukeOverlay.style.color = '#ff5e5e';
        elements.siteNukeTitle.textContent = 'If you have epilepsy or are photosensitive, leave the page now.';
        elements.siteNukeTimer.textContent = secondsLeft.toFixed(2);
        elements.siteNukeNote.textContent = 'Admin takeover starts in 5 seconds.';
        return;
      }

      if (currentMs < flashEndMs) {
        const phaseIndex = Math.floor((currentMs - countdownEndMs) / 95) % flashPalette.length;
        const background = flashPalette[phaseIndex];
        const darkBackground = background !== '#ffffff';
        elements.siteNukeOverlay.classList.add('visible', 'is-flash-phase');
        elements.siteNukeOverlay.style.background = background;
        elements.siteNukeOverlay.style.color = darkBackground ? '#ffffff' : '#111111';
        elements.siteNukeTitle.textContent = '';
        elements.siteNukeTimer.textContent = '';
        elements.siteNukeNote.textContent = '';
        return;
      }

      hideNukeOverlay(false);
    };

    render();
    state.nukeSequenceHandle = window.setInterval(render, 1);
  }

  function normalizeSiteState(siteState) {
    return {
      broadcastMessage: siteState && siteState.broadcastMessage ? String(siteState.broadcastMessage) : '',
      pinnedMessage: siteState && siteState.pinnedMessage ? String(siteState.pinnedMessage) : '',
      trollRollNonce: siteState && siteState.trollRollNonce ? String(siteState.trollRollNonce) : '',
      trollSoundNonce: siteState && siteState.trollSoundNonce ? String(siteState.trollSoundNonce) : '',
      trollSoundUrl: siteState && siteState.trollSoundUrl ? String(siteState.trollSoundUrl) : '',
      trollMediaNonce: siteState && siteState.trollMediaNonce ? String(siteState.trollMediaNonce) : '',
      trollMediaUrl: siteState && siteState.trollMediaUrl ? String(siteState.trollMediaUrl) : '',
      trollFlashbangNonce: siteState && siteState.trollFlashbangNonce ? String(siteState.trollFlashbangNonce) : '',
      trollFlashbangTriggeredAt: siteState && siteState.trollFlashbangTriggeredAt ? String(siteState.trollFlashbangTriggeredAt) : '',
      trollBustNonce: siteState && siteState.trollBustNonce ? String(siteState.trollBustNonce) : '',
      trollBustTriggeredAt: siteState && siteState.trollBustTriggeredAt ? String(siteState.trollBustTriggeredAt) : '',
      trollNukeNonce: siteState && siteState.trollNukeNonce ? String(siteState.trollNukeNonce) : '',
      trollNukeTriggeredAt: siteState && siteState.trollNukeTriggeredAt ? String(siteState.trollNukeTriggeredAt) : '',
      updated: siteState && siteState.updated ? String(siteState.updated) : ''
    };
  }

  function applySiteState(siteState) {
    const elements = getElements();
    const nextState = normalizeSiteState(siteState);
    const broadcastKey = nextState.broadcastMessage
      ? nextState.broadcastMessage + '|' + nextState.updated
      : '';
    const shouldShowBroadcast = !!nextState.broadcastMessage && broadcastKey !== state.lastBroadcastKey;
    const shouldTriggerRoll = state.hasSeenSiteState &&
      nextState.trollRollNonce &&
      nextState.trollRollNonce !== state.siteState.trollRollNonce;
    const shouldTriggerSound = state.hasSeenSiteState &&
      nextState.trollSoundNonce &&
      nextState.trollSoundNonce !== state.siteState.trollSoundNonce &&
      nextState.trollSoundUrl;
    const shouldTriggerMedia = state.hasSeenSiteState &&
      nextState.trollMediaNonce &&
      nextState.trollMediaNonce !== state.siteState.trollMediaNonce &&
      nextState.trollMediaUrl;
    const flashbangExpiryMs = (Date.parse(nextState.trollFlashbangTriggeredAt || '') || 0) + 5000;
    const shouldTriggerFlashbang = !!nextState.trollFlashbangNonce &&
      nextState.trollFlashbangTriggeredAt &&
      flashbangExpiryMs > nowMs() &&
      (
        nextState.trollFlashbangNonce !== state.siteState.trollFlashbangNonce ||
        (!state.hasSeenSiteState && nextState.trollFlashbangNonce !== state.activeFlashbangNonce)
      );
    const bustExpiryMs = (Date.parse(nextState.trollBustTriggeredAt || '') || 0) + 7000;
    const shouldTriggerBust = !!nextState.trollBustNonce &&
      nextState.trollBustTriggeredAt &&
      bustExpiryMs > nowMs() &&
      (
        nextState.trollBustNonce !== state.siteState.trollBustNonce ||
        (!state.hasSeenSiteState && nextState.trollBustNonce !== state.activeBustNonce)
      );
    const nukeExpiryMs = (Date.parse(nextState.trollNukeTriggeredAt || '') || 0) + 11000;
    const shouldTriggerNuke = !!nextState.trollNukeNonce &&
      nextState.trollNukeTriggeredAt &&
      nukeExpiryMs > nowMs() &&
      (
        nextState.trollNukeNonce !== state.siteState.trollNukeNonce ||
        (!state.hasSeenSiteState && nextState.trollNukeNonce !== state.activeNukeNonce)
      );

    state.siteState = nextState;
    state.hasSeenSiteState = true;
    state.lastBroadcastKey = broadcastKey;

    if (elements.siteBroadcastBanner) {
      if (!nextState.broadcastMessage) {
        hideBroadcastToast(true);
      } else if (shouldShowBroadcast) {
        showBroadcastToast(nextState.broadcastMessage);
      }
    }

    if (isOwner()) {
      if (elements.adminBroadcastInput && document.activeElement !== elements.adminBroadcastInput) {
        elements.adminBroadcastInput.value = nextState.broadcastMessage;
      }

      if (elements.adminPinnedInput && document.activeElement !== elements.adminPinnedInput) {
        elements.adminPinnedInput.value = nextState.pinnedMessage;
      }

      if (elements.adminSoundName) {
        elements.adminSoundName.textContent = nextState.trollSoundUrl ? 'Uploaded sound ready' : 'No sound uploaded';
      }

      if (elements.adminMediaName) {
        elements.adminMediaName.textContent = nextState.trollMediaUrl ? 'Uploaded image ready' : 'No image uploaded';
      }
    }

    if (shouldTriggerRoll) {
      triggerBarrelRoll();
    }

    if (shouldTriggerSound) {
      playAdminSound(nextState.trollSoundUrl);
    }

    if (shouldTriggerMedia) {
      showTrollMedia(nextState.trollMediaUrl);
    }

    if (shouldTriggerFlashbang) {
      startFlashbangSequence(nextState.trollFlashbangTriggeredAt, nextState.trollFlashbangNonce);
    }

    if (shouldTriggerBust) {
      startBustSequence(nextState.trollBustTriggeredAt, nextState.trollBustNonce);
    }

    if (shouldTriggerNuke) {
      startNukeSequence(nextState.trollNukeTriggeredAt, nextState.trollNukeNonce);
    }

    renderRoomChrome();
  }

  function resetCropState() {
    const elements = getElements();
    const crop = state.crop;

    if (crop.objectUrl) {
      URL.revokeObjectURL(crop.objectUrl);
    }

    crop.image = null;
    crop.objectUrl = '';
    crop.zoom = 1;
    crop.baseScale = 1;
    crop.offsetX = 0;
    crop.offsetY = 0;
    crop.dragging = false;
    crop.target = '';

    if (elements.avatarCropZoom) {
      elements.avatarCropZoom.value = '1';
    }

    if (elements.avatarCropModal) {
      elements.avatarCropModal.classList.remove('visible');
      elements.avatarCropModal.setAttribute('aria-hidden', 'true');
    }
  }

  function drawCropPreview() {
    const elements = getElements();
    const crop = state.crop;

    if (!elements.avatarCropCanvas || !crop.image) {
      return;
    }

    const context = elements.avatarCropCanvas.getContext('2d');
    const width = elements.avatarCropCanvas.width;
    const height = elements.avatarCropCanvas.height;

    context.clearRect(0, 0, width, height);
    context.fillStyle = '#0f1115';
    context.fillRect(0, 0, width, height);

    const scale = crop.baseScale * crop.zoom;
    const drawWidth = crop.image.width * scale;
    const drawHeight = crop.image.height * scale;
    const x = (width - drawWidth) / 2 + crop.offsetX;
    const y = (height - drawHeight) / 2 + crop.offsetY;

    context.drawImage(crop.image, x, y, drawWidth, drawHeight);
  }

  function openCropperForFile(file, target) {
    const elements = getElements();
    const crop = state.crop;

    if (!elements.avatarCropModal || !elements.avatarCropCanvas || !file) {
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    const image = new Image();

    image.onload = function () {
      if (crop.objectUrl && crop.objectUrl !== objectUrl) {
        URL.revokeObjectURL(crop.objectUrl);
      }

      crop.image = image;
      crop.objectUrl = objectUrl;
      crop.zoom = 1;
      crop.baseScale = Math.max(
        elements.avatarCropCanvas.width / image.width,
        elements.avatarCropCanvas.height / image.height
      );
      crop.offsetX = 0;
      crop.offsetY = 0;
      crop.target = target;

      if (elements.avatarCropZoom) {
        elements.avatarCropZoom.value = '1';
      }

      drawCropPreview();
      elements.avatarCropModal.classList.add('visible');
      elements.avatarCropModal.setAttribute('aria-hidden', 'false');
    };

    image.onerror = function () {
      URL.revokeObjectURL(objectUrl);
      setFeedback(getElements().accountAvatarFeedback, 'error', 'Unable to read that image.');
    };

    image.src = objectUrl;
  }

  function buildCroppedBlob() {
    return new Promise(function (resolve, reject) {
      const elements = getElements();
      if (!elements.avatarCropCanvas) {
        reject(new Error('No crop canvas available.'));
        return;
      }

      const outputCanvas = document.createElement('canvas');
      outputCanvas.width = 256;
      outputCanvas.height = 256;
      const context = outputCanvas.getContext('2d');
      context.drawImage(elements.avatarCropCanvas, 0, 0, 256, 256);

      outputCanvas.toBlob(function (blob) {
        if (!blob) {
          reject(new Error('Unable to export the crop.'));
          return;
        }
        resolve(blob);
      }, 'image/png', 0.92);
    });
  }

  async function uploadProfileAvatar(blob, fileName) {
    const formData = new FormData();
    formData.append('avatar', blob, fileName || 'avatar.png');
    const response = await pb.send('/api/chat/avatar', {
      method: 'POST',
      body: formData,
      requestKey: null
    });

    if (response && response.user) {
      await refreshSession();
      await loadBootstrap();
    }

    setFeedback(getElements().accountAvatarFeedback, 'success', 'Profile picture updated.');
  }

  async function uploadGroupAvatar(roomId, blob) {
    const formData = new FormData();
    formData.append('roomId', roomId);
    formData.append('avatar', blob, 'group-avatar.png');
    await pb.send('/api/chat/group/avatar', {
      method: 'POST',
      body: formData,
      requestKey: null
    });
  }

  async function approveCropUpload() {
    const elements = getElements();
    if (!state.crop.image || !pb || !isAuthenticated()) {
      resetCropState();
      return;
    }

    if (elements.avatarCropApprove) {
      elements.avatarCropApprove.disabled = true;
    }

    try {
      const blob = await buildCroppedBlob();

      if (state.crop.target === 'profile') {
        await uploadProfileAvatar(blob, 'avatar.png');
      } else if (state.crop.target === 'group-create') {
        state.pendingGroupAvatarFile = new File([blob], 'group-avatar.png', { type: 'image/png' });
        if (elements.chatGroupAvatarName) {
          elements.chatGroupAvatarName.textContent = 'Group image ready';
        }
      } else if (state.crop.target === 'group-manage' && state.manageGroupRoomId) {
        await uploadGroupAvatar(state.manageGroupRoomId, blob);
        state.pendingManageGroupAvatarFile = null;
        if (elements.chatManageGroupAvatarName) {
          elements.chatManageGroupAvatarName.textContent = 'Group image updated';
        }
        await loadBootstrap();
        if (state.activeRoomId === state.manageGroupRoomId) {
          await loadActiveRoom();
        }
      }
    } catch (error) {
      setFeedback(elements.accountAvatarFeedback, 'error', extractErrorMessage(error, 'Unable to upload that image.'));
    } finally {
      if (elements.avatarCropApprove) {
        elements.avatarCropApprove.disabled = false;
      }
      resetCropState();
    }
  }

  async function api(path, method, body) {
    const options = {
      method: method || 'GET',
      requestKey: null
    };

    if (body instanceof FormData) {
      options.body = body;
    } else if (body !== undefined) {
      options.body = JSON.stringify(body || {});
    }

    return pb.send(path, options);
  }

  function getBootstrapData() {
    return state.bootstrap || {
      user: null,
      moderation: null,
      globalRoom: null,
      groupRooms: [],
      dmRooms: [],
      friends: [],
      incomingRequests: [],
      outgoingRequests: [],
      blockedUsers: [],
      mentionDirectory: [],
      mentionNotifications: []
    };
  }

  function findRoomSummaryById(roomId) {
    const data = getBootstrapData();
    const allRooms = []
      .concat(data.globalRoom ? [data.globalRoom] : [])
      .concat(data.groupRooms || [])
      .concat(data.dmRooms || [])
      .concat(state.transientDmRoom ? [state.transientDmRoom] : []);

    for (let i = 0; i < allRooms.length; i += 1) {
      if (allRooms[i] && allRooms[i].id === roomId) {
        return allRooms[i];
      }
    }

    return null;
  }

  function mergeRoomSummaryIntoBootstrap(roomId, patch) {
    if (!roomId || !patch) {
      return;
    }

    if (state.bootstrap) {
      if (state.bootstrap.globalRoom && state.bootstrap.globalRoom.id === roomId) {
        state.bootstrap.globalRoom = Object.assign({}, state.bootstrap.globalRoom, patch);
      }

      if (Array.isArray(state.bootstrap.groupRooms)) {
        state.bootstrap.groupRooms = state.bootstrap.groupRooms.map(function (room) {
          return room && room.id === roomId ? Object.assign({}, room, patch) : room;
        });
      }

      if (Array.isArray(state.bootstrap.dmRooms)) {
        state.bootstrap.dmRooms = state.bootstrap.dmRooms.map(function (room) {
          return room && room.id === roomId ? Object.assign({}, room, patch) : room;
        });
      }
    }

    if (state.transientDmRoom && state.transientDmRoom.id === roomId) {
      state.transientDmRoom = Object.assign({}, state.transientDmRoom, patch);
    }
  }

  function syncRoomSummaryFromState(roomState) {
    if (!roomState || !roomState.room || !roomState.room.id) {
      return;
    }

    const messages = Array.isArray(roomState.messages) ? roomState.messages : [];
    const latestMessage = messages.length ? messages[messages.length - 1] : null;
    const patch = {
      lastMessagePreview: latestMessage ? getMessagePreviewText(latestMessage) : (roomState.room.lastMessagePreview || ''),
      lastMessageAt: latestMessage ? (latestMessage.created || '') : (roomState.room.lastMessageAt || '')
    };

    roomState.room = Object.assign({}, roomState.room, patch);
    mergeRoomSummaryIntoBootstrap(roomState.room.id, patch);
  }

  function ensureActiveRoomFromBootstrap() {
    const data = getBootstrapData();
    const availableRoom = findRoomSummaryById(state.activeRoomId);

    if (state.activeView === 'groups') {
      if (!availableRoom) {
        state.activeRoomId = data.globalRoom ? data.globalRoom.id : '';
      }
      return;
    }

    if (state.activeView === 'dms' && state.activeRoomId) {
      return;
    }

    if (state.activeView === 'dms' && data.dmRooms && data.dmRooms.length && !state.activeRoomId) {
      state.activeRoomId = data.dmRooms[0].id;
      return;
    }

    if (state.activeView === 'friends') {
      state.activeRoomId = '';
      state.activeRoom = null;
    }
  }

  function renderListAvatar(container, label, url) {
    const fallback = container.querySelector('span');
    const image = container.querySelector('img');
    setAvatarImageSource(container, fallback, image, label, url);
  }

  function createListItem(config) {
    const item = document.createElement('button');
    item.className = 'chat-list-item' + (config.active ? ' is-active' : '');
    item.type = 'button';
    item.dataset.kind = config.kind || '';
    item.dataset.id = config.id || '';

    const avatar = document.createElement('div');
    avatar.className = 'chat-list-avatar';
    avatar.innerHTML = '<span>?</span><img alt="">';
    renderListAvatar(avatar, config.title || '', config.avatarUrl || '');

    const copy = document.createElement('div');
    copy.className = 'chat-list-copy';

    const titleRow = document.createElement('div');
    titleRow.className = 'chat-list-title-row';

    const title = document.createElement('div');
    title.className = 'chat-list-title';
    if (config.userTitle) {
      setUsernameDisplay(title, config.title || 'Conversation');
    } else {
      title.textContent = config.title || 'Conversation';
    }

    const meta = document.createElement('div');
    meta.className = 'chat-list-meta';
    meta.textContent = config.meta || '';

    titleRow.appendChild(title);
    titleRow.appendChild(meta);

    const preview = document.createElement('div');
    preview.className = 'chat-list-preview';
    preview.textContent = config.preview || '';

    const subline = document.createElement('div');
    subline.className = 'chat-list-subline';
    subline.textContent = config.subline || '';

    copy.appendChild(titleRow);
    if (config.preview) {
      copy.appendChild(preview);
    }
    if (config.subline) {
      copy.appendChild(subline);
    }

    item.appendChild(avatar);
    item.appendChild(copy);

    if (config.tag) {
      const tag = document.createElement('div');
      tag.className = 'chat-list-tag';
      tag.textContent = config.tag;
      item.appendChild(tag);
    }

    return item;
  }

  function renderConversationList() {
    const elements = getElements();
    const data = getBootstrapData();
    const list = elements.chatConversationList;

    if (!list) {
      return;
    }

    list.innerHTML = '';

    if (state.activeView === 'groups') {
      const rooms = [];
      if (data.globalRoom) {
        rooms.push({
          id: data.globalRoom.id,
          title: data.globalRoom.name || 'Global Chat',
          avatarUrl: buildRoomAvatarUrl(data.globalRoom),
          preview: data.globalRoom.lastMessagePreview || 'The main room for everyone.',
          meta: data.globalRoom.lastMessageAt ? formatListPreviewTime(data.globalRoom.lastMessageAt) : '',
          subline: '',
          tag: 'Global'
        });
      }

      (data.groupRooms || []).forEach(function (room) {
        rooms.push({
          id: room.id,
          title: room.name,
          avatarUrl: buildRoomAvatarUrl(room),
          preview: room.lastMessagePreview || 'No messages yet',
          meta: room.lastMessageAt ? formatListPreviewTime(room.lastMessageAt) : '',
          subline: room.memberCount ? room.memberCount + ' members' : 'Group chat',
          tag: 'Group'
        });
      });

      if (!rooms.length) {
        const empty = document.createElement('div');
        empty.className = 'chat-empty-state';
        empty.textContent = 'No group chats yet.';
        list.appendChild(empty);
        return;
      }

      rooms.forEach(function (room) {
        const item = createListItem({
          kind: 'room',
          id: room.id,
          title: room.title,
          avatarUrl: room.avatarUrl,
          preview: room.preview,
          meta: room.meta,
          subline: room.subline,
          tag: room.tag,
          active: state.activeRoomId === room.id
        });
        list.appendChild(item);
      });
      return;
    }

    if (state.activeView === 'friends') {
      (data.friends || []).forEach(function (friend) {
        const item = createListItem({
          kind: 'friend',
          id: friend.id,
          title: friend.username,
          userTitle: true,
          avatarUrl: buildUserAvatarUrl(friend),
          preview: formatRelativeDay(friend.lastSeenAt),
          meta: '',
          subline: friend.created ? 'Joined ' + formatAbsoluteTime(friend.created) : '',
          tag: 'Friend'
        });
        item.dataset.username = friend.username;
        list.appendChild(item);
      });

      if (!(data.friends || []).length) {
        const empty = document.createElement('div');
        empty.className = 'chat-empty-state';
        empty.textContent = 'No friends yet. Send a request to start building your list.';
        list.appendChild(empty);
      }
      return;
    }

    if (state.activeView === 'dms') {
      const rooms = (data.dmRooms || []).slice();
      if (state.transientDmRoom && !rooms.some(function (room) { return room.id === state.transientDmRoom.id; })) {
        rooms.unshift(state.transientDmRoom);
      }

      if (!rooms.length) {
        const empty = document.createElement('div');
        empty.className = 'chat-empty-state';
        empty.textContent = 'No DMs yet. Open one from the friends tab or a message menu.';
        list.appendChild(empty);
        return;
      }

      rooms.forEach(function (room) {
        const peer = room.peer || null;
        const item = createListItem({
          kind: 'room',
          id: room.id,
          title: peer ? peer.username : room.name,
          userTitle: !!peer,
          avatarUrl: peer ? buildUserAvatarUrl(peer) : buildRoomAvatarUrl(room),
          preview: room.lastMessagePreview || 'No messages yet',
          meta: room.lastMessageAt ? formatListPreviewTime(room.lastMessageAt) : '',
          subline: peer ? formatRelativeDay(peer.lastSeenAt) : 'Direct message',
          tag: 'DM',
          active: state.activeRoomId === room.id
        });
        list.appendChild(item);
      });
    }
  }

  function renderFriendRequests() {
    const elements = getElements();
    const data = getBootstrapData();
    const showFriends = state.activeView === 'friends';

    setElementVisibility(elements.chatAddFriendForm, showFriends);
    setElementVisibility(elements.chatIncomingRequestsSection, showFriends && (data.incomingRequests || []).length > 0);
    setElementVisibility(elements.chatOutgoingRequestsSection, showFriends && (data.outgoingRequests || []).length > 0);
    setElementVisibility(elements.chatBlockedSection, showFriends && (data.blockedUsers || []).length > 0);

    if (elements.chatIncomingRequestsList) {
      elements.chatIncomingRequestsList.innerHTML = '';
      (data.incomingRequests || []).forEach(function (request) {
        const card = document.createElement('div');
        card.className = 'chat-request-card';
        card.innerHTML = '' +
          '<div class="chat-request-head">' +
            '<div class="chat-list-avatar"><span>?</span><img alt=""></div>' +
              '<div class="chat-list-copy">' +
              '<div class="chat-list-title"></div>' +
              '<div class="chat-list-subline">' + formatRelativeDay(request.user.lastSeenAt) + '</div>' +
            '</div>' +
          '</div>' +
          '<div class="chat-request-actions">' +
            '<button class="community-btn community-btn-primary" data-request-action="accept" data-request-id="' + request.id + '" type="button">Accept</button>' +
            '<button class="community-btn community-btn-secondary" data-request-action="decline" data-request-id="' + request.id + '" type="button">Decline</button>' +
          '</div>';
        renderListAvatar(card.querySelector('.chat-list-avatar'), request.user.username, buildUserAvatarUrl(request.user));
        setUsernameDisplay(card.querySelector('.chat-list-title'), request.user.username);
        elements.chatIncomingRequestsList.appendChild(card);
      });
    }

    if (elements.chatOutgoingRequestsList) {
      elements.chatOutgoingRequestsList.innerHTML = '';
      (data.outgoingRequests || []).forEach(function (request) {
        const card = document.createElement('div');
        card.className = 'chat-request-card';
        card.innerHTML = '' +
          '<div class="chat-request-head">' +
            '<div class="chat-list-avatar"><span>?</span><img alt=""></div>' +
              '<div class="chat-list-copy">' +
              '<div class="chat-list-title"></div>' +
              '<div class="chat-list-subline">Waiting for a response</div>' +
            '</div>' +
          '</div>';
        renderListAvatar(card.querySelector('.chat-list-avatar'), request.user.username, buildUserAvatarUrl(request.user));
        setUsernameDisplay(card.querySelector('.chat-list-title'), request.user.username);
        elements.chatOutgoingRequestsList.appendChild(card);
      });
    }

    if (elements.chatBlockedList) {
      elements.chatBlockedList.innerHTML = '';
      (data.blockedUsers || []).forEach(function (user) {
        const card = document.createElement('div');
        card.className = 'chat-request-card';
        card.innerHTML = '' +
          '<div class="chat-request-head">' +
            '<div class="chat-list-avatar"><span>?</span><img alt=""></div>' +
              '<div class="chat-list-copy">' +
              '<div class="chat-list-title"></div>' +
              '<div class="chat-list-subline">Friend requests are still allowed.</div>' +
            '</div>' +
          '</div>' +
          '<div class="chat-request-actions">' +
            '<button class="community-btn community-btn-secondary" data-block-action="unblock" data-username="' + user.username + '" type="button">Unblock</button>' +
          '</div>';
        renderListAvatar(card.querySelector('.chat-list-avatar'), user.username, buildUserAvatarUrl(user));
        setUsernameDisplay(card.querySelector('.chat-list-title'), user.username);
        elements.chatBlockedList.appendChild(card);
      });
    }
  }

  function renderSidebarMeta() {
    const elements = getElements();
    if (!elements.chatSidebarHeading || !elements.chatSidebarKicker || !elements.chatSidebarPrimaryButton) {
      return;
    }

    let kickerText = '';
    let headingText = '';
    let showPrimaryButton = false;

    if (state.activeView === 'groups') {
      headingText = 'Groupchats';
      showPrimaryButton = true;
    } else if (state.activeView === 'friends') {
      kickerText = 'Requests + list';
      headingText = 'Friends';
    } else {
      kickerText = 'Private';
      headingText = 'DMs';
    }

    elements.chatSidebarKicker.textContent = kickerText;
    setElementVisibility(elements.chatSidebarKicker, !!kickerText);
    elements.chatSidebarHeading.textContent = headingText;
    elements.chatSidebarPrimaryButton.textContent = 'New Group';
    elements.chatSidebarPrimaryButton.hidden = !showPrimaryButton;
  }

  function syncChatModeTabs(view) {
    const elements = getElements();
    if (!elements.chatModeTabs) {
      return;
    }

    Array.prototype.forEach.call(elements.chatModeTabs.querySelectorAll('[data-chat-view]'), function (button) {
      button.classList.toggle('is-active', button.dataset.chatView === view);
    });
  }

  function renderRoomIdentity(room, roomMembers) {
    const elements = getElements();
    if (!elements.chatRoomTitle || !elements.chatRoomSubtitle || !elements.chatRoomAvatar) {
      return;
    }

    let label = room.name || 'Conversation';
    let subtitle = 'No conversation selected.';
    let avatarUrl = buildRoomAvatarUrl(room);

    if (room.type === 'global') {
      subtitle = 'Global chat clears every 2 hours.';
    } else if (room.type === 'dm') {
      const peer = room.peer || (roomMembers || []).filter(function (member) {
        return !state.session || !state.session.user || member.id !== state.session.user.id;
      })[0];
      if (peer) {
        label = peer.username;
        subtitle = formatRelativeDay(peer.lastSeenAt) + ' · 24 hour history';
        avatarUrl = buildUserAvatarUrl(peer);
      } else {
        subtitle = '24 hour history';
      }
    } else if (room.type === 'group') {
      subtitle = (roomMembers || []).length + ' members · oldest 500 trim after 1000';
    }

    if (room.type === 'dm') {
      setUsernameDisplay(elements.chatRoomTitle, label, { tooltip: true });
    } else {
      elements.chatRoomTitle.textContent = label;
    }
    elements.chatRoomSubtitle.textContent = subtitle;
    renderListAvatar(elements.chatRoomAvatar, label, avatarUrl);
  }

  function setChatStatus(message, type) {
    const elements = getElements();
    if (!elements.chatStatusBanner) {
      return;
    }

    if (!message) {
      elements.chatStatusBanner.hidden = true;
      elements.chatStatusBanner.textContent = '';
      elements.chatStatusBanner.className = 'chat-status-banner';
      return;
    }

    elements.chatStatusBanner.hidden = false;
    elements.chatStatusBanner.textContent = message;
    elements.chatStatusBanner.className = 'chat-status-banner';
    if (type) {
      elements.chatStatusBanner.classList.add('is-' + type);
    }
  }

  function renderRoomChrome() {
    const elements = getElements();
    const room = state.activeRoom && state.activeRoom.room ? state.activeRoom.room : null;
    const members = state.activeRoom && Array.isArray(state.activeRoom.members) ? state.activeRoom.members : [];
    const moderation = getModerationSnapshot();

    setElementVisibility(elements.chatMainEmpty, !room);
    setElementVisibility(elements.chatRoomPanel, !!room);

    if (!room) {
      clearMentionSuggestions();
      clearPendingReply(false);
      clearPendingChatImage();
      return;
    }

    renderRoomIdentity(room, members);
    setElementVisibility(elements.chatClearBanner, !!room.lastClearedLabel);
    if (elements.chatClearBanner) {
      elements.chatClearBanner.textContent = room.lastClearedLabel || '';
    }

    const pinnedMessage = room.type === 'global' ? state.siteState.pinnedMessage : '';
    setElementVisibility(elements.chatPinnedBanner, !!pinnedMessage);
    if (elements.chatPinnedBanner) {
      elements.chatPinnedBanner.textContent = pinnedMessage || '';
    }

    const usernameUnset = isCurrentUsernameUnset();
    const locked = isAccountLocked();
    const canSend = !locked && !usernameUnset && !moderation.isBanned && !(moderation.muteUntil && new Date(moderation.muteUntil).getTime() > nowMs());
    if (elements.chatComposer) {
      elements.chatComposer.classList.toggle('disabled', !canSend);
    }
    if (elements.chatMessageInput) {
      elements.chatMessageInput.disabled = !canSend;
      elements.chatMessageInput.placeholder = locked
        ? (moderation.isDeleted ? 'This deleted account cannot chat.' : 'This account is banned from sending messages.')
        : usernameUnset
          ? 'Change your username before chatting.'
          : moderation.muteUntil && new Date(moderation.muteUntil).getTime() > nowMs()
          ? 'You are timed out right now.'
          : room.type === 'global'
            ? 'Say something to Global Chat...'
            : room.type === 'group'
              ? 'Send a message to the group...'
              : 'Send a DM...';
    }
    if (elements.chatSendButton) {
      elements.chatSendButton.disabled = !canSend;
    }
    if (elements.chatImageButton) {
      elements.chatImageButton.disabled = !canSend || !canAttachImagesToRoom(room);
    }

    renderChatComposerAttachmentState();

    let bannerMessage = '';
    let bannerType = '';
    if (moderation.isDeleted) {
      bannerMessage = 'This account was deleted. You can keep playing games, but account and chat actions are locked.';
      bannerType = 'danger';
    } else if (moderation.isBanned) {
      bannerMessage = moderation.banUntil
        ? 'Your account is banned. Unbans in ' + formatDurationUntil(moderation.banUntil) + '.'
        : 'Your account is banned from chat.';
      bannerType = 'danger';
    } else if (usernameUnset) {
      bannerMessage = 'Change your username before sending messages.';
      bannerType = 'warning';
    } else if (moderation.muteUntil && new Date(moderation.muteUntil).getTime() > nowMs()) {
      bannerMessage = 'Timeout active. You can talk again in ' + formatDurationUntil(moderation.muteUntil) + '.';
      bannerType = 'warning';
    } else if (moderation.warnings > 0) {
      bannerMessage = getWarningStatusText(moderation.warnings);
      bannerType = 'warning';
    }
    setChatStatus(bannerMessage, bannerType);

    renderRoomActions(room, members);
  }

  function renderRoomActions(room, members) {
    const elements = getElements();
    if (!elements.chatRoomActions) {
      return;
    }

    elements.chatRoomActions.innerHTML = '';

    if (room.type === 'group') {
      const manage = document.createElement('button');
      manage.className = 'community-btn community-btn-secondary';
      manage.type = 'button';
      manage.textContent = 'Manage Group';
      manage.dataset.roomAction = 'manage-group';
      manage.dataset.roomId = room.id;
      elements.chatRoomActions.appendChild(manage);

      if (room.ownerId === (state.session && state.session.user ? state.session.user.id : '')) {
        const remove = document.createElement('button');
        remove.className = 'community-btn community-btn-danger';
        remove.type = 'button';
        remove.textContent = 'Delete Group';
        remove.dataset.roomAction = 'delete-group';
        remove.dataset.roomId = room.id;
        elements.chatRoomActions.appendChild(remove);
      } else {
        const leave = document.createElement('button');
        leave.className = 'community-btn community-btn-secondary';
        leave.type = 'button';
        leave.textContent = 'Leave Group';
        leave.dataset.roomAction = 'leave-group';
        leave.dataset.roomId = room.id;
        elements.chatRoomActions.appendChild(leave);
      }

      return;
    }

    if (room.type === 'dm') {
      const peer = room.peer || (members || []).filter(function (member) {
        return !state.session || !state.session.user || member.id !== state.session.user.id;
      })[0];
      if (peer) {
        const badge = document.createElement('button');
        badge.className = 'community-btn community-btn-secondary';
        badge.type = 'button';
        badge.textContent = 'Friend: ' + peer.username;
        badge.disabled = true;
        elements.chatRoomActions.appendChild(badge);
      }
    }
  }

  function renderMessages() {
    const elements = getElements();
    const roomState = state.activeRoom;
    const room = roomState && roomState.room ? roomState.room : null;
    const allMessages = roomState && Array.isArray(roomState.messages) ? roomState.messages : [];
    const messages = allMessages.length > 300 ? allMessages.slice(-300) : allMessages;

    if (!elements.chatMessageList) {
      return;
    }

    const preserveBottomOffset = elements.chatMessageList._userScrolledUp
      ? (elements.chatMessageList.scrollHeight - elements.chatMessageList.scrollTop)
      : 0;

    if (!room) {
      state.lastRenderedMessagesKey = '';
      elements.chatMessageList.innerHTML = '';
      return;
    }

    const renderKey = [
      room.id || '',
      state.openMessageMenuId || '',
      messages.length,
      messages.length ? messages[0].id : '',
      messages.length ? messages[messages.length - 1].id : '',
      messages.length ? messages[messages.length - 1].updated || messages[messages.length - 1].created || '' : ''
    ].join('|');

    if (state.lastRenderedMessagesKey === renderKey) {
      return;
    }
    state.lastRenderedMessagesKey = renderKey;
    elements.chatMessageList.innerHTML = '';

    if (!messages.length) {
      const emptyState = document.createElement('div');
      emptyState.className = 'chat-empty-state';
      emptyState.textContent = room.type === 'dm'
        ? 'No messages yet. Start the DM to make it show up in your DM list.'
        : 'No messages yet. Start the conversation.';
      elements.chatMessageList.appendChild(emptyState);
      return;
    }

    const authId = state.session && state.session.user ? state.session.user.id : '';
    const ownerMode = isOwner();
    const staffMode = canUseModerationTools();
    const fragment = document.createDocumentFragment();

    messages.forEach(function (message) {
      const row = document.createElement('article');
      row.className = 'chat-message';
      if (message.authorId && message.authorId === authId) {
        row.classList.add('own');
      }

      const messageAuthor = findKnownUserSummary(message.authorId, message.authorUsername);
      const avatarUrl = String(message.authorAvatarUrl || '').trim()
        || (message.authorId && message.authorAvatar
          ? buildCollectionFileUrl('users', message.authorId, message.authorAvatar)
          : '')
        || (messageAuthor ? buildUserAvatarUrl(messageAuthor) : '');
      const avatarHolder = createChatMessageAvatarElement(
        message.authorUsername || 'User',
        avatarUrl
      );

      const content = document.createElement('div');
      content.className = 'chat-message-content';

      const replyData = message.replyTo && message.replyTo.messageId
        ? message.replyTo
        : null;

      if (replyData) {
        const reply = document.createElement('div');
        reply.className = 'chat-message-reply';

        const replyLabel = document.createElement('div');
        replyLabel.className = 'chat-message-reply-label';
        replyLabel.textContent = replyData.authorUsername || 'User';

        const replyPreview = document.createElement('div');
        replyPreview.className = 'chat-message-reply-preview';
        replyPreview.textContent = String(replyData.body || '').trim() || (replyData.hasImage ? 'Sent an image' : 'Original message');

        reply.appendChild(replyLabel);
        reply.appendChild(replyPreview);
        content.appendChild(reply);
      }

      const meta = document.createElement('div');
      meta.className = 'chat-message-meta';

      const user = document.createElement('div');
      user.className = 'chat-message-user';
      const messageRole = normalizeRoleValue(
        message.authorRole ||
        message.role ||
        (messageAuthor ? messageAuthor.role : '')
      );
      setUsernameDisplay(user, message.authorUsername || 'User', { tooltip: true, role: messageRole });

      const time = document.createElement('time');
      time.className = 'chat-message-time';
      time.dateTime = message.created || '';
      time.textContent = formatAbsoluteTime(message.created);

      meta.appendChild(user);
      meta.appendChild(time);

      const actions = document.createElement('div');
      actions.className = 'chat-message-actions';

      const replyButton = document.createElement('button');
      replyButton.className = 'chat-message-reply-button';
      replyButton.type = 'button';
      replyButton.dataset.chatAction = 'reply-message';
      replyButton.dataset.messageId = message.id;
      replyButton.dataset.username = message.authorUsername || '';
      replyButton.innerHTML = '<i class="fas fa-reply"></i><span class="chat-message-reply-tooltip">Reply</span>';
      actions.appendChild(replyButton);

      const menu = document.createElement('div');
      menu.className = 'chat-message-admin';
      const isMenuOpen = state.openMessageMenuId === message.id;
      menu.classList.toggle('is-open', isMenuOpen);

      const toggle = document.createElement('button');
      toggle.className = 'chat-message-menu-toggle';
      toggle.type = 'button';
      toggle.dataset.chatMenuToggle = message.id;
      toggle.setAttribute('aria-expanded', isMenuOpen ? 'true' : 'false');
      toggle.innerHTML = '<i class="fas fa-ellipsis"></i>';
      menu.appendChild(toggle);

      const menuBody = document.createElement('div');
      menuBody.className = 'chat-message-menu';

      function appendMenuItem(label, action, danger) {
        const button = document.createElement('button');
        button.className = 'chat-message-menu-item' + (danger ? ' is-danger' : '');
        button.type = 'button';
        button.textContent = label;
        button.dataset.chatAction = action;
        button.dataset.messageId = message.id;
        button.dataset.username = message.authorUsername || '';
        button.dataset.userId = message.authorId || '';
        menuBody.appendChild(button);
      }

      if (message.authorId && message.authorId !== authId) {
        appendMenuItem('Add Friend', 'friend-request', false);
        appendMenuItem('Direct Message', 'open-dm', false);
        appendMenuItem('Report', 'report-message', false);
        appendMenuItem('Block User', 'block-user', true);
      }

      if (staffMode) {
        appendMenuItem('Delete Message', 'admin-delete-message', true);
        if (message.authorId && message.authorId !== authId) {
          appendMenuItem(ownerMode ? 'Delete All From User' : 'Delete Last 300', 'admin-delete-user-messages', true);
          if (!isOwnerUsername(message.authorUsername, message.authorRole || message.role)) {
            appendMenuItem(ownerMode ? 'Timeout 30m' : 'Timeout 1h', 'admin-timeout-user', false);
            appendMenuItem(ownerMode ? 'Ban 3d' : 'Ban 48h', 'admin-ban-user', false);
            appendMenuItem('Reset PFP', 'admin-reset-avatar', false);
            appendMenuItem('Reset Username', 'admin-reset-username', false);
            if (ownerMode) {
              appendMenuItem('Delete Account', 'admin-delete-user', true);
            }
          }
        }
      }

      if (menuBody.children.length) {
        menu.appendChild(menuBody);
        actions.appendChild(menu);
      }

      meta.appendChild(actions);

      const bubble = document.createElement('div');
      bubble.className = 'chat-message-bubble';

      const imageUrl = getChatMessageImageUrl(message);
      if (imageUrl) {
        const imageLink = document.createElement('a');
        imageLink.className = 'chat-message-image-link';
        imageLink.href = imageUrl;
        imageLink.target = '_blank';
        imageLink.rel = 'noopener noreferrer';

        const image = document.createElement('img');
        image.className = 'chat-message-image';
        image.src = imageUrl;
        image.alt = 'Shared image';
        image.loading = 'lazy';

        imageLink.appendChild(image);
        bubble.appendChild(imageLink);
      }

      if (message.body) {
        const body = document.createElement('div');
        body.className = 'chat-message-body';
        appendMessageTextWithMentions(body, message.body || '');
        bubble.appendChild(body);
      }

      content.appendChild(meta);
      content.appendChild(bubble);
      row.appendChild(avatarHolder);
      row.appendChild(content);
      fragment.appendChild(row);
    });
    elements.chatMessageList.appendChild(fragment);

    if (elements.chatMessageList._userScrolledUp) {
      elements.chatMessageList.scrollTop = Math.max(
        0,
        elements.chatMessageList.scrollHeight - preserveBottomOffset
      );
    } else {
      elements.chatMessageList.scrollTop = elements.chatMessageList.scrollHeight;
    }
  }

  function renderAdminReports() {
    const elements = getElements();
    if (!elements.adminReportsList) {
      return;
    }

    elements.adminReportsList.innerHTML = '';
    const filterValue = elements.adminReportsFilter ? (elements.adminReportsFilter.value || 'open') : 'open';
    const ownerMode = canUseOwnerTools();
    const durationPlaceholder = ownerMode ? '30' : '1';
    const actionOptions = ownerMode
      ? '<option value="timeout">Timeout</option><option value="ban">Ban</option><option value="delete_account">Delete Account</option><option value="reset_avatar">Reset PFP</option><option value="delete_user_messages">Delete 300 Messages</option><option value="reset_username">Reset Username</option>'
      : '<option value="timeout">Timeout</option><option value="ban">Ban</option><option value="reset_avatar">Reset PFP</option><option value="delete_user_messages">Delete 300 Messages</option><option value="reset_username">Reset Username</option>';
    const filteredReports = state.adminReports
      .slice()
      .sort(function (left, right) {
        const leftStatus = normalizeAdminReportStatus(left.status);
        const rightStatus = normalizeAdminReportStatus(right.status);
        if (leftStatus !== rightStatus) {
          return leftStatus === 'open' ? -1 : 1;
        }
        return new Date(right.updated || right.created || 0).getTime() - new Date(left.updated || left.created || 0).getTime();
      })
      .filter(function (report) {
        if (filterValue === 'all') {
          return true;
        }
        return normalizeAdminReportStatus(report.status) === filterValue;
      });

    if (!filteredReports.length) {
      const empty = document.createElement('div');
      empty.className = 'chat-empty-state';
      empty.textContent = filterValue === 'closed'
        ? 'No closed reports.'
        : (filterValue === 'all' ? 'No reports yet.' : 'No open reports.');
      elements.adminReportsList.appendChild(empty);
      return;
    }

    filteredReports.forEach(function (report) {
      const card = document.createElement('div');
      card.className = 'admin-report-card';

      const status = normalizeAdminReportStatus(report.status);
      const controlsDisabled = status !== 'open' ? ' disabled' : '';
      const statusLabel = status === 'open' ? 'Open' : 'Closed';
      const actionLine = report.actionNote
        ? '<div class="admin-report-copy">Action: ' + escapeHtml(report.actionNote) + '</div>'
        : '';

      card.innerHTML = '' +
        '<div class="admin-report-head">' +
          '<div>' +
            '<div class="admin-report-title-line">' +
              '<div class="admin-report-title">' + escapeHtml(report.reportedUsername) + ' · ' + escapeHtml((report.roomType || '').toUpperCase()) + '</div>' +
              '<div class="admin-report-tag ' + (status === 'open' ? 'is-open' : 'is-closed') + '">' + statusLabel + '</div>' +
            '</div>' +
            '<div class="admin-report-meta">Reporter: ' + escapeHtml(report.reporterUsername) + ' · Room: ' + escapeHtml(report.roomName) + ' · ' + formatAbsoluteTime(report.created) + '</div>' +
          '</div>' +
        '</div>' +
        '<div class="admin-report-snapshot">' + escapeHtml(report.messageSnapshot) + '</div>' +
        '<div class="admin-report-copy">Reason: ' + escapeHtml(report.reason) + '</div>' +
        '<div class="admin-report-controls">' +
          '<select class="text-input" data-report-select="' + report.id + '"' + controlsDisabled + '>' +
            actionOptions +
          '</select>' +
          '<input class="text-input" data-report-duration="' + report.id + '" min="1" placeholder="' + durationPlaceholder + '" type="number"' + controlsDisabled + '>' +
          '<select class="text-input" data-report-unit="' + report.id + '"' + controlsDisabled + '>' +
            '<option value="minutes">Minutes</option>' +
            '<option value="hours">Hours</option>' +
            '<option value="days">Days</option>' +
          '</select>' +
        '</div>' +
        '<div class="admin-report-actions">' +
          '<button class="community-btn community-btn-primary" data-report-action="apply" data-report-id="' + report.id + '"' + controlsDisabled + ' type="button">Apply</button>' +
          '<button class="community-btn community-btn-secondary" data-report-action="dismiss" data-report-id="' + report.id + '"' + controlsDisabled + ' type="button">Dismiss</button>' +
        '</div>' +
        actionLine;

      elements.adminReportsList.appendChild(card);
    });
  }

  function renderAvatarPreview() {
    const elements = getElements();
    const session = state.session;
    const username = session && session.user ? session.user.username : '';
    const avatarUrl = session && session.user ? buildUserAvatarUrl(session.user) : '';

    if (!elements.accountAvatarPreview || !elements.accountAvatarImage || !elements.accountAvatarFallback) {
      return;
    }

    setAvatarImageSource(
      elements.accountAvatarPreview,
      elements.accountAvatarFallback,
      elements.accountAvatarImage,
      username || 'User',
      avatarUrl
    );
  }

  function normalizeAdminReportStatus(status) {
    return status === 'pending' ? 'open' : 'closed';
  }

  function renderAuthState() {
    const elements = getElements();
    const authenticated = isAuthenticated();
    const session = state.session;
    const ownerMode = isOwner();
    const staffMode = isStaff();
    const moderation = getModerationSnapshot();
    const locked = isAccountLocked();
    const usernameUnset = authenticated && isCurrentUsernameUnset();
    const usernameChangeAvailableAt = session && session.account ? session.account.usernameChangeAvailableAt : null;

    setElementVisibility(elements.accountAuthCard, !authenticated);
    setElementVisibility(elements.accountProfileCard, authenticated);
    setElementVisibility(elements.accountStatusCard, authenticated && !ownerMode);
    setElementVisibility(elements.accountUsernameCard, authenticated && !ownerMode && canUseAccountActions());
    setElementVisibility(elements.accountPasswordCard, authenticated && !ownerMode && canUseAccountActions() && !usernameUnset);
    setElementVisibility(elements.accountDangerCard, authenticated);

    setElementVisibility(elements.adminTab, authenticated && staffMode);
    if (elements.adminTab) {
      elements.adminTab.textContent = ownerMode ? 'ADMIN' : 'MOD';
      elements.adminTab.style.display = authenticated && staffMode ? '' : 'none';
    }
    const adminTitle = elements.adminSection ? elements.adminSection.querySelector('.modal-title') : null;
    if (adminTitle) {
      adminTitle.innerHTML = ownerMode
        ? '<i class="fas fa-crown"></i> Owner'
        : '<i class="fas fa-shield-halved"></i> Mod';
    }
    setElementVisibility(elements.adminModCard, authenticated && ownerMode);
    setElementVisibility(elements.adminOwnerCard, authenticated && ownerMode);
    setElementVisibility(elements.adminUserCard, authenticated && ownerMode);
    setElementVisibility(elements.adminTrollCard, authenticated && ownerMode);
    setElementVisibility(elements.adminReportsCard, authenticated && staffMode);
    if (authenticated && ownerMode) {
      if (!state.modsDirectory.length) {
        setModsDirectory(buildLocalStaffDirectory());
      } else {
        renderModsDirectory();
      }
    } else {
      setModsDirectory([]);
    }

    if (!staffMode && elements.adminSection && elements.adminSection.style.display !== 'none' && window.switchTab) {
      window.switchTab(authenticated ? 'account' : 'lessons');
    }

    if (elements.accountProfileUsername) {
      elements.accountProfileUsername.textContent = authenticated && session && session.user
        ? session.user.username
        : 'guest';
      elements.accountProfileUsername.classList.toggle('is-unset', authenticated && isUnsetUsername(elements.accountProfileUsername.textContent));
    }

    if (elements.accountProfileCreated) {
      const createdAt = session && session.user ? session.user.created : '';
      elements.accountProfileCreated.textContent = createdAt ? 'Joined ' + formatAbsoluteTime(createdAt) : 'New account';
    }

    if (elements.accountWarningsCount) {
      elements.accountWarningsCount.textContent = String(moderation.warnings || 0);
    }

    if (elements.accountUsernameChangeTime) {
      elements.accountUsernameChangeTime.textContent = usernameChangeAvailableAt && new Date(usernameChangeAvailableAt).getTime() > nowMs()
        ? formatDurationUntil(usernameChangeAvailableAt)
        : 'Now';
    }

    if (elements.accountModerationDetail) {
      if (!authenticated) {
        elements.accountModerationDetail.textContent = 'Create an account to unlock chat and track your moderation status.';
      } else if (moderation.isDeleted) {
        elements.accountModerationDetail.textContent = 'This account was deleted. You stay signed in, but chat, account changes, deletion, and save export are locked.';
      } else if (moderation.isBanned) {
        elements.accountModerationDetail.textContent = moderation.banUntil
          ? 'Account banned. Chat unlocks in ' + formatDurationUntil(moderation.banUntil) + '.'
          : 'Account banned from chat.';
      } else if (usernameUnset) {
        elements.accountModerationDetail.textContent = 'Choose a username before you can talk in chat.';
      } else if (moderation.muteUntil && new Date(moderation.muteUntil).getTime() > nowMs()) {
        elements.accountModerationDetail.textContent = 'Timeout active for ' + formatDurationUntil(moderation.muteUntil) + '.';
      } else if (moderation.warnings > 0) {
        elements.accountModerationDetail.textContent = getWarningStatusText(moderation.warnings);
      } else {
        elements.accountModerationDetail.textContent = 'No active penalties on your account.';
      }
    }

    if (elements.accountUsernameDescription) {
      elements.accountUsernameDescription.textContent = locked
        ? 'Locked accounts cannot change usernames.'
        : usernameUnset
          ? 'Your username was reset. Pick a new one before chatting.'
          : 'Usernames are unique and can only be changed once every 7 days.';
    }

    if (elements.accountUsernameInput) {
      elements.accountUsernameInput.disabled = !authenticated || ownerMode || !canUseAccountActions();
    }

    if (elements.avatarUploadButton) {
      elements.avatarUploadButton.disabled = !authenticated || !canUseAccountActions();
    }

    if (elements.accountDeleteButton) {
      elements.accountDeleteButton.disabled = !authenticated || ownerMode || !canUseAccountActions();
    }

    if (elements.accountLogoutButton) {
      elements.accountLogoutButton.disabled = !authenticated || locked;
    }

    renderAvatarPreview();

    const chatLocked = !authenticated;
    if (elements.chatAppShell) {
      elements.chatAppShell.classList.toggle('is-locked', chatLocked);
    }
  }

  async function refreshSession() {
    if (state.sessionRequest) {
      return state.sessionRequest;
    }

    if (!hasAuthToken()) {
      state.session = null;
      renderAuthState();
      return null;
    }

    state.sessionRequest = (async function () {
      try {
        const session = await api('/api/chat/session', 'GET');
        state.session = session;
        if (session && session.user) {
          clearAccountLock();
        }
        if (session && session.user) {
          pb.authStore.save(pb.authStore.token, Object.assign({}, pb.authStore.model || {}, session.user));
        }
        renderAuthState();
        if (isOwner()) {
          loadModsDirectory();
        }
        if (shouldPollAdminReports()) {
          loadAdminReports();
        } else if (!isOwner()) {
          state.adminReports = [];
          state.modsDirectory = [];
          renderAdminReports();
        }
        return session;
      } catch (error) {
        var status = error && error.status ? error.status : 0;
        if (status === 401 || status === 403) {
          const message = extractErrorMessage(error, '');
          const until = (error && error.data && (error.data.banUntil || error.data.until)) ||
            (error && error.response && (error.response.banUntil || error.response.until)) ||
            null;
          const deleted = status === 401 || /delete|deleted|not found|missing|removed/i.test(message);
          markAccountLocked(deleted ? 'deleted' : 'banned', message || (deleted ? 'Account deleted.' : 'Account banned.'), until);
          state.bootstrap = null;
          state.activeRoom = null;
          state.activeRoomId = '';
          state.transientDmRoom = null;
          state.adminReports = [];
          state.modsDirectory = [];
          renderAuthState();
          renderConversationList();
          renderFriendRequests();
          renderRoomChrome();
          renderMessages();
          renderAdminReports();
          return state.session;
        }
        return null;
      } finally {
        state.sessionRequest = null;
      }
    })();

    return state.sessionRequest;
  }

  async function fetchSiteState() {
    if (!pb || !shouldPollSiteState()) {
      return;
    }

    if (state.siteStateRequest) {
      return state.siteStateRequest;
    }

    state.siteStateRequest = (async function () {
      try {
        applySiteState(await api('/api/site/state', 'GET'));
      } catch (error) {
      } finally {
        state.siteStateRequest = null;
      }
    })();

    return state.siteStateRequest;
  }

  async function loadBootstrap() {
    if (!pb || !isAuthenticated() || isAccountLocked()) {
      state.bootstrap = null;
      renderConversationList();
      renderFriendRequests();
      renderRoomChrome();
      renderMessages();
      return null;
    }

    if (state.bootstrapRequest) {
      return state.bootstrapRequest;
    }

    state.bootstrapRequest = (async function () {
      try {
        state.bootstrap = await api('/api/chat/bootstrap', 'GET');
        consumeMentionNotifications(state.bootstrap && state.bootstrap.mentionNotifications);
        if (state.activeRoom && state.activeRoom.room) {
          syncRoomSummaryFromState(state.activeRoom);
        }
        ensureActiveRoomFromBootstrap();
        renderSidebarMeta();
        renderConversationList();
        renderFriendRequests();
        renderAuthState();
        if (isOwner()) {
          loadModsDirectory();
        }
        return state.bootstrap;
      } catch (error) {
        const status = error && error.status ? error.status : 0;
        if (status === 401 || status === 403) {
          await refreshSession();
          renderConversationList();
          renderFriendRequests();
          renderRoomChrome();
          renderMessages();
          return null;
        }
        setChatStatus(extractErrorMessage(error, 'Unable to load chat right now.'), 'danger');
        return null;
      } finally {
        state.bootstrapRequest = null;
      }
    })();

    return state.bootstrapRequest;
  }

  async function loadActiveRoom() {
    if (!pb || !isAuthenticated() || isAccountLocked() || !state.activeRoomId) {
      state.activeRoom = null;
      renderRoomChrome();
      renderMessages();
      return null;
    }

    if (state.activeRoomRequest) {
      return state.activeRoomRequest;
    }

    state.activeRoomRequest = (async function () {
      try {
        const roomResponse = await api('/api/chat/room', 'POST', { roomId: state.activeRoomId });
        const summary = findRoomSummaryById(state.activeRoomId) || roomResponse.room;
        const room = Object.assign({}, summary || {}, roomResponse.room || {});

        if (room.type === 'dm') {
          const peer = (roomResponse.members || []).filter(function (member) {
            return !state.session || !state.session.user || member.id !== state.session.user.id;
          })[0] || (summary ? summary.peer : null);
          room.peer = peer || null;
          state.transientDmRoom = room.lastMessageAt ? null : room;
        }

        state.activeRoom = {
          room: room,
          messages: Array.isArray(roomResponse.messages) ? roomResponse.messages : [],
          members: Array.isArray(roomResponse.members) ? roomResponse.members : [],
          pinnedMessage: roomResponse.pinnedMessage || ''
        };

        syncRoomSummaryFromState(state.activeRoom);

        renderRoomChrome();
        renderMessages();
        renderConversationList();
        return state.activeRoom;
      } catch (error) {
        const status = error && error.status ? error.status : 0;
        if (status === 401 || status === 403) {
          await refreshSession();
          state.activeRoom = null;
          renderRoomChrome();
          renderMessages();
          renderConversationList();
          return null;
        }
        state.activeRoom = null;
        if (state.activeView === 'groups') {
          const data = getBootstrapData();
          state.activeRoomId = data.globalRoom ? data.globalRoom.id : '';
        } else {
          state.activeRoomId = '';
        }
        renderRoomChrome();
        renderMessages();
        renderConversationList();
        return null;
      } finally {
        state.activeRoomRequest = null;
      }
    })();

    return state.activeRoomRequest;
  }

  function scheduleBootstrapPoll() {
    if (state.bootstrapPollHandle) {
      clearInterval(state.bootstrapPollHandle);
    }

    state.bootstrapPollHandle = window.setInterval(function () {
      if (shouldPollChatData()) {
        loadBootstrap();
      }
    }, 10000);
  }

  function scheduleRoomPoll() {
    if (state.roomPollHandle) {
      clearInterval(state.roomPollHandle);
    }

    state.roomPollHandle = window.setInterval(function () {
      if (shouldPollChatData() && state.activeRoomId) {
        loadActiveRoom();
      }
    }, 6000);
  }

  function scheduleSessionPoll() {
    if (state.sessionPollHandle) {
      clearInterval(state.sessionPollHandle);
    }

    state.sessionPollHandle = window.setInterval(function () {
      if (hasAuthToken() && isDocumentVisible()) {
        refreshSession();
      }
    }, 120000);
  }

  function scheduleSiteStatePoll() {
    if (state.siteStateHandle) {
      clearInterval(state.siteStateHandle);
    }

    state.siteStateHandle = window.setInterval(function () {
      if (shouldPollSiteState()) {
        fetchSiteState();
      }
    }, 12000);
  }

  function scheduleAdminReportsPoll() {
    if (state.adminReportsHandle) {
      clearInterval(state.adminReportsHandle);
    }

    state.adminReportsHandle = window.setInterval(function () {
      if (shouldPollAdminReports()) {
        loadAdminReports();
      }
    }, 15000);
  }

  async function loadAdminReports() {
    if (!pb || !isStaff()) {
      state.adminReports = [];
      renderAdminReports();
      return;
    }

    if (state.adminReportsRequest) {
      return state.adminReportsRequest;
    }

    state.adminReportsRequest = (async function () {
      try {
        const response = await api('/api/admin/reports', 'GET');
        state.adminReports = Array.isArray(response.reports) ? response.reports : [];
        renderAdminReports();
      } catch (error) {
        state.adminReports = [];
        renderAdminReports();
      } finally {
        state.adminReportsRequest = null;
      }
    })();

    return state.adminReportsRequest;
  }

  async function openDmWithUsername(username) {
    try {
      clearMentionSuggestions();
      clearPendingReply(false);
      clearPendingChatImage();
      const response = await api('/api/chat/open-dm', 'POST', {
        username: username
      });
      state.openMessageMenuId = '';
      state.activeView = 'dms';
      if (response && response.room) {
        state.transientDmRoom = response.room;
        state.activeRoomId = response.room.id;
      }
      syncChatModeTabs('dms');
      renderSidebarMeta();
      renderConversationList();
      renderFriendRequests();
      await loadActiveRoom();
    } catch (error) {
      setChatStatus(extractErrorMessage(error, 'Unable to open that DM.'), 'warning');
    }
  }

  function setActiveView(view) {
    if (state.activeView === view) {
      return;
    }

    clearMentionSuggestions();
    clearPendingReply(false);
    clearPendingChatImage();
    state.openMessageMenuId = '';
    state.activeView = view;

    if (view === 'groups') {
      const data = getBootstrapData();
      state.activeRoomId = data.globalRoom ? data.globalRoom.id : '';
      loadActiveRoom();
    } else if (view === 'friends') {
      state.activeRoomId = '';
      state.activeRoom = null;
      renderRoomChrome();
      renderMessages();
    } else if (view === 'dms') {
      const data = getBootstrapData();
      if (!state.activeRoomId && data.dmRooms && data.dmRooms.length) {
        state.activeRoomId = data.dmRooms[0].id;
        loadActiveRoom();
      } else if (state.activeRoomId) {
        loadActiveRoom();
      }
    }

    renderSidebarMeta();
    renderConversationList();
    renderFriendRequests();

    syncChatModeTabs(view);
  }

  function isAdminActionAllowed(action) {
    if (canUseOwnerTools()) {
      return true;
    }

    if (!canUseModerationTools()) {
      return false;
    }

    return [
      'delete_message',
      'delete_user_messages',
      'timeout_user',
      'ban_user',
      'reset_avatar',
      'reset_username'
    ].indexOf(action) !== -1;
  }

  function getCanonicalAdminAction(action) {
    const normalized = String(action || '').toLowerCase().trim();
    if (['timeout_user', 'timeout', 'mute_user', 'user_timeout'].indexOf(normalized) !== -1) {
      return 'timeout_user';
    }
    if (['ban_user', 'ban', 'ban_account', 'user_ban'].indexOf(normalized) !== -1) {
      return 'ban_user';
    }
    if (['delete_user_messages', 'purge_user_messages', 'delete_messages'].indexOf(normalized) !== -1) {
      return 'delete_user_messages';
    }
    if (['reset_avatar', 'reset_pfp', 'clear_avatar', 'remove_avatar'].indexOf(normalized) !== -1) {
      return 'reset_avatar';
    }
    if (['reset_username', 'unset_username', 'force_reset_username', 'set_username_unset'].indexOf(normalized) !== -1) {
      return 'reset_username';
    }
    if (['rename_user', 'change_username', 'update_username', 'rename_account'].indexOf(normalized) !== -1) {
      return 'rename_user';
    }
    if (['set_role', 'add_mod', 'remove_mod', 'promote_mod', 'demote_mod', 'set_mod', 'unset_mod', 'grant_mod', 'revoke_mod'].indexOf(normalized) !== -1) {
      return 'set_role';
    }
    if (['show_media', 'show_image', 'trigger_media', 'broadcast_media', 'troll_media'].indexOf(normalized) !== -1) {
      return 'show_media';
    }
    if (['trigger_flashbang', 'flashbang', 'trigger_flash', 'show_flashbang'].indexOf(normalized) !== -1) {
      return 'trigger_flashbang';
    }
    if (['trigger_bust', 'bust', 'trigger_bust_effect', 'show_bust'].indexOf(normalized) !== -1) {
      return 'trigger_bust';
    }
    return normalized;
  }

  function clampModModerationPayload(action, payload) {
    if (canUseOwnerTools()) {
      return payload;
    }

    const nextPayload = Object.assign({}, payload || {});
    const canonical = getCanonicalAdminAction(action);
    if (canonical === 'timeout_user') {
      const minutes = Math.max(1, parseInt(nextPayload.minutes || '60', 10) || 60);
      nextPayload.minutes = String(Math.min(minutes, 48 * 60));
    }

    if (canonical === 'ban_user') {
      const days = Math.max(1, parseInt(nextPayload.days || '2', 10) || 2);
      nextPayload.days = String(Math.min(days, 2));
    }

    if (canonical === 'delete_user_messages') {
      nextPayload.limit = String(Math.min(300, Math.max(1, parseInt(nextPayload.limit || '300', 10) || 300)));
    }

    return nextPayload;
  }

  function findKnownUserIdByUsername(rawUsername) {
    const normalizedTarget = normalizeUsernameValue(rawUsername);
    if (!normalizedTarget) {
      return '';
    }
    const data = getBootstrapData();
    const candidates = []
      .concat(state.session && state.session.user ? [state.session.user] : [])
      .concat(data.mentionDirectory || [])
      .concat(data.friends || [])
      .concat(data.blockedUsers || [])
      .concat((data.incomingRequests || []).map(function (request) { return request.user; }))
      .concat((data.outgoingRequests || []).map(function (request) { return request.user; }))
      .concat((data.dmRooms || []).map(function (room) { return room && room.peer ? room.peer : null; }))
      .concat(state.activeRoom && Array.isArray(state.activeRoom.members) ? state.activeRoom.members : [])
      .concat(state.activeRoom && Array.isArray(state.activeRoom.messages) ? state.activeRoom.messages : []);

    for (let i = 0; i < candidates.length; i += 1) {
      const candidate = candidates[i];
      if (!candidate) {
        continue;
      }
      const candidateUsername = normalizeUsernameValue(
        candidate.username ||
        candidate.authorUsername ||
        candidate.fromUsername ||
        candidate.toUsername ||
        ''
      );
      if (candidateUsername !== normalizedTarget) {
        continue;
      }
      const id = String(
        candidate.id ||
        candidate.userId ||
        candidate.authorId ||
        candidate.fromUserId ||
        candidate.toUserId ||
        ''
      ).trim();
      if (id) {
        return id;
      }
    }

    return '';
  }

  function buildAdminActionPayloadVariants(action, payload) {
    const base = Object.assign({}, payload || {});
    const canonical = getCanonicalAdminAction(action);
    const variants = [];
    const addVariant = function (candidate) {
      variants.push(Object.assign({}, candidate || {}));
    };

    if (canonical === 'rename_user') {
      const oldUsername = sanitizeUsernameInputValue(base.currentUsername || base.username || base.oldUsername || base.targetUsername || '');
      const newUsername = sanitizeUsernameInputValue(base.newUsername || base.updatedUsername || base.toUsername || '');
      const oldCandidates = buildUsernameCandidates(oldUsername).slice(0, 3);
      const newCandidates = buildUsernameCandidates(newUsername).slice(0, 3);
      const knownUserId = findKnownUserIdByUsername(oldUsername);

      for (let i = 0; i < oldCandidates.length; i += 1) {
        for (let j = 0; j < newCandidates.length; j += 1) {
          const from = oldCandidates[i];
          const to = newCandidates[j];
          addVariant(Object.assign({}, base, { currentUsername: from, newUsername: to, username: from }));
          addVariant(Object.assign({}, base, { oldUsername: from, username: to }));
          addVariant(Object.assign({}, base, { fromUsername: from, toUsername: to }));
          addVariant(Object.assign({}, base, { targetUsername: from, updatedUsername: to }));
          if (knownUserId) {
            addVariant(Object.assign({}, base, { userId: knownUserId, currentUsername: from, newUsername: to, username: from }));
          }
        }
      }

      if (!variants.length) {
        addVariant(base);
      }
      return variants;
    }

    const usernameSource = sanitizeUsernameInputValue(base.username || base.targetUsername || base.accountUsername || '');
    const usernameCandidates = buildUsernameCandidates(usernameSource).slice(0, 3);
    const knownUserId = String(base.userId || findKnownUserIdByUsername(usernameSource) || '').trim();

    if (!usernameCandidates.length) {
      addVariant(base);
      return variants;
    }

    usernameCandidates.forEach(function (candidateUsername) {
      const candidatePayload = Object.assign({}, base, {
        username: candidateUsername,
        targetUsername: candidateUsername,
        accountUsername: candidateUsername
      });
      if (canonical === 'set_role') {
        const roleValue = String(base.role || base.newRole || base.accessRole || '').trim();
        if (roleValue) {
          candidatePayload.role = roleValue;
          candidatePayload.newRole = roleValue;
          candidatePayload.accessRole = roleValue;
        }
      }
      if (knownUserId) {
        candidatePayload.userId = knownUserId;
      }
      addVariant(candidatePayload);
      addVariant(Object.assign({}, candidatePayload, {
        user: candidateUsername
      }));
    });

    return variants;
  }

  function getAdminActionFallbacks(action, payload) {
    const canonical = getCanonicalAdminAction(action);
    const fallbacks = [action, canonical];

    if (canonical === 'set_role') {
      const targetRole = normalizeRoleValue((payload && (payload.role || payload.newRole || payload.accessRole)) || '');
      if (targetRole === 'mod' || targetRole === 'moderator') {
        fallbacks.push('add_mod', 'promote_mod', 'set_mod', 'grant_mod', 'add_moderator');
      } else if (targetRole === 'user' || !targetRole) {
        fallbacks.push('remove_mod', 'demote_mod', 'unset_mod', 'revoke_mod', 'remove_moderator');
      } else {
        fallbacks.push('set_mod', 'update_role');
      }
    }

    if (canonical === 'reset_username') {
      fallbacks.push('unset_username', 'force_reset_username', 'set_username_unset');
    }

    if (canonical === 'rename_user') {
      fallbacks.push('change_username', 'update_username', 'rename_account');
    }

    if (canonical === 'show_media') {
      fallbacks.push('show_image', 'trigger_media', 'broadcast_media', 'troll_media');
    }

    if (canonical === 'trigger_flashbang') {
      fallbacks.push('flashbang', 'trigger_flash', 'show_flashbang');
    }

    if (canonical === 'trigger_bust') {
      fallbacks.push('bust', 'trigger_bust_effect', 'show_bust');
    }

    return dedupeStrings(fallbacks.map(function (entry) {
      return String(entry || '').trim();
    }));
  }

  async function runAdminAction(action, payload, successMessage, confirmMessage) {
    const elements = getElements();
    const normalizedPayload = Object.assign({}, payload || {});
    const usernameActions = [
      'set_role',
      'timeout_user',
      'ban_user',
      'reset_avatar',
      'delete_user_messages',
      'reset_username',
      'delete_user'
    ];
    const canonicalAction = getCanonicalAdminAction(action);
    if (usernameActions.indexOf(action) !== -1 || usernameActions.indexOf(canonicalAction) !== -1) {
      const safeUsername = sanitizeUsernameInputValue(
        normalizedPayload.username ||
        normalizedPayload.targetUsername ||
        normalizedPayload.accountUsername ||
        ''
      );
      if (!safeUsername) {
        setFeedback(elements.adminFeedback, 'error', 'Enter a valid username first.');
        return null;
      }
      normalizedPayload.username = safeUsername;
      normalizedPayload.targetUsername = safeUsername;
    }
    if (canonicalAction === 'rename_user') {
      const currentUsername = sanitizeUsernameInputValue(normalizedPayload.currentUsername || normalizedPayload.username || '');
      const nextUsername = sanitizeUsernameInputValue(normalizedPayload.newUsername || normalizedPayload.updatedUsername || '');
      if (!currentUsername || !nextUsername) {
        setFeedback(elements.adminFeedback, 'error', 'Enter both current and new usernames.');
        return null;
      }
      normalizedPayload.currentUsername = currentUsername;
      normalizedPayload.newUsername = nextUsername;
      normalizedPayload.username = currentUsername;
    }

    if (!isAdminActionAllowed(action)) {
      setFeedback(elements.adminFeedback, 'error', canUseModerationTools() ? 'This action is owner-only.' : 'Mod access required.');
      return null;
    }

    if (confirmMessage && !window.confirm(confirmMessage)) {
      return null;
    }

    try {
      const actionFallbacks = getAdminActionFallbacks(action, normalizedPayload);
      const payloadVariants = buildAdminActionPayloadVariants(action, normalizedPayload);

      let lastError = null;
      for (let index = 0; index < actionFallbacks.length; index += 1) {
        const candidateAction = actionFallbacks[index];
        for (let payloadIndex = 0; payloadIndex < payloadVariants.length; payloadIndex += 1) {
          const candidatePayload = payloadVariants[payloadIndex];
          try {
            const response = await api('/api/admin/action', 'POST', Object.assign({}, clampModModerationPayload(candidateAction, candidatePayload), { action: candidateAction }));
            if (response && (response.success === false || response.ok === false || response.error)) {
              throw new Error(response.message || 'Admin action failed.');
            }
            setFeedback(elements.adminFeedback, 'success', successMessage || response.message || 'Done.');
            return response;
          } catch (candidateError) {
            lastError = candidateError;
            if (index < actionFallbacks.length - 1 || payloadIndex < payloadVariants.length - 1) {
              const status = candidateError && candidateError.status ? candidateError.status : 0;
              if (!(status === 400 || status === 404 || status === 422)) {
                break;
              }
            }
          }
        }
      }

      throw (lastError || new Error('Admin action failed.'));
    } catch (error) {
      setFeedback(elements.adminFeedback, 'error', extractErrorMessage(error, 'Admin action failed.'));
      return null;
    }
  }

  function isModLikeRole(role) {
    const normalized = normalizeRoleValue(role);
    return normalized === 'mod' || normalized === 'moderator';
  }

  function isStaffRole(role) {
    return isOwnerLikeRole(role) || isModLikeRole(role);
  }

  function getBestRoleForCandidate(currentRole, nextRole) {
    const currentNormalized = normalizeRoleValue(currentRole);
    const nextNormalized = normalizeRoleValue(nextRole);
    if (!nextNormalized) {
      return currentNormalized;
    }
    if (!currentNormalized) {
      return nextNormalized;
    }
    if (isOwnerLikeRole(nextNormalized) && !isOwnerLikeRole(currentNormalized)) {
      return nextNormalized;
    }
    return currentNormalized;
  }

  function getRoleLabel(role) {
    const normalized = normalizeRoleValue(role);
    if (normalized === 'owner') {
      return 'Owner';
    }
    if (normalized === 'admin' || normalized === 'coowner') {
      return 'Co-Owner';
    }
    if (normalized === 'moderator') {
      return 'Moderator';
    }
    if (normalized === 'mod') {
      return 'Mod';
    }
    return 'Staff';
  }

  function getRolePriority(role) {
    const normalized = normalizeRoleValue(role);
    if (normalized === 'owner') {
      return 0;
    }
    if (normalized === 'admin' || normalized === 'coowner') {
      return 1;
    }
    if (normalized === 'moderator' || normalized === 'mod') {
      return 2;
    }
    return 3;
  }

  function buildLocalStaffDirectory() {
    const byUsername = {};
    const data = getBootstrapData();

    function addCandidate(candidate) {
      if (!candidate) {
        return;
      }
      const rawUsername = candidate.username || candidate.authorUsername || '';
      const username = normalizeUsernameValue(rawUsername);
      if (!username) {
        return;
      }
      const role = normalizeRoleValue(
        candidate.role ||
        candidate.authorRole ||
        candidate.userRole ||
        candidate.memberRole ||
        ''
      );
      const fallbackRole = isOwnerUsername(username) ? 'owner' : '';
      if (!isStaffRole(role) && !fallbackRole) {
        return;
      }

      if (!byUsername[username]) {
        byUsername[username] = {
          username: username,
          role: role || fallbackRole
        };
        return;
      }

      byUsername[username].role = getBestRoleForCandidate(byUsername[username].role, role || fallbackRole);
    }

    addCandidate(state.session && state.session.user ? state.session.user : null);
    (data.mentionDirectory || []).forEach(addCandidate);
    (data.friends || []).forEach(addCandidate);
    (data.blockedUsers || []).forEach(addCandidate);
    (data.incomingRequests || []).forEach(function (request) { addCandidate(request && request.user); });
    (data.outgoingRequests || []).forEach(function (request) { addCandidate(request && request.user); });
    (data.dmRooms || []).forEach(function (room) { addCandidate(room && room.peer); });
    (state.activeRoom && Array.isArray(state.activeRoom.members) ? state.activeRoom.members : []).forEach(addCandidate);
    (state.activeRoom && Array.isArray(state.activeRoom.messages) ? state.activeRoom.messages : []).forEach(addCandidate);

    return Object.keys(byUsername)
      .map(function (username) {
        return byUsername[username];
      })
      .sort(function (left, right) {
        const priorityDiff = getRolePriority(left.role) - getRolePriority(right.role);
        if (priorityDiff !== 0) {
          return priorityDiff;
        }
        return left.username.localeCompare(right.username);
      });
  }

  function setModsDirectory(nextDirectory) {
    state.modsDirectory = Array.isArray(nextDirectory) ? nextDirectory : [];
    renderModsDirectory();
  }

  function renderModsDirectory() {
    const elements = getElements();
    if (!elements.adminModsList) {
      return;
    }

    elements.adminModsList.innerHTML = '';
    const list = Array.isArray(state.modsDirectory) ? state.modsDirectory : [];
    if (!list.length) {
      const empty = document.createElement('div');
      empty.className = 'admin-mod-empty';
      empty.textContent = 'No mods found yet.';
      elements.adminModsList.appendChild(empty);
      return;
    }

    list.forEach(function (entry) {
      const row = document.createElement('div');
      row.className = 'admin-mod-item';

      const username = document.createElement('span');
      username.className = 'admin-mod-name';
      username.textContent = entry.username || 'unknown';

      const role = document.createElement('span');
      role.className = 'admin-mod-role';
      role.textContent = getRoleLabel(entry.role);

      row.appendChild(username);
      row.appendChild(role);
      elements.adminModsList.appendChild(row);
    });
  }

  function normalizeStaffDirectoryResponse(response) {
    if (!response) {
      return [];
    }
    const rawList = []
      .concat(Array.isArray(response.mods) ? response.mods : [])
      .concat(Array.isArray(response.staff) ? response.staff : [])
      .concat(Array.isArray(response.users) ? response.users : [])
      .concat(Array.isArray(response.data) ? response.data : []);

    const byUsername = {};
    rawList.forEach(function (entry) {
      const username = normalizeUsernameValue(
        typeof entry === 'string'
          ? entry
          : (entry && (entry.username || entry.name || ''))
      );
      if (!username) {
        return;
      }
      const role = normalizeRoleValue(
        typeof entry === 'string'
          ? 'mod'
          : (entry && (entry.role || entry.type || ''))
      );
      if (!isStaffRole(role) && !isOwnerUsername(username, role)) {
        return;
      }
      if (!byUsername[username]) {
        byUsername[username] = {
          username: username,
          role: role || (isOwnerUsername(username) ? 'owner' : 'mod')
        };
      } else {
        byUsername[username].role = getBestRoleForCandidate(byUsername[username].role, role);
      }
    });

    return Object.keys(byUsername).map(function (username) {
      return byUsername[username];
    }).sort(function (left, right) {
      const priorityDiff = getRolePriority(left.role) - getRolePriority(right.role);
      if (priorityDiff !== 0) {
        return priorityDiff;
      }
      return left.username.localeCompare(right.username);
    });
  }

  async function loadModsDirectory() {
    if (!isOwner()) {
      setModsDirectory([]);
      return [];
    }

    if (state.modsDirectoryRequest) {
      return state.modsDirectoryRequest;
    }

    state.modsDirectoryRequest = (async function () {
      const localFallback = buildLocalStaffDirectory();
      const endpoints = [
        '/api/admin/mods',
        '/api/admin/staff',
        '/api/admin/mod-list'
      ];

      for (let i = 0; i < endpoints.length; i += 1) {
        try {
          const response = await api(endpoints[i], 'GET');
          const normalized = normalizeStaffDirectoryResponse(response);
          if (normalized.length) {
            setModsDirectory(normalized);
            return normalized;
          }
        } catch (error) {
        }
      }

      setModsDirectory(localFallback);
      return localFallback;
    })();

    try {
      return await state.modsDirectoryRequest;
    } finally {
      state.modsDirectoryRequest = null;
    }
  }

  function parseCommaSeparatedUsernames(value) {
    const seen = {};
    return String(value || '')
      .split(',')
      .map(function (entry) {
        return normalizeUsernameValue(entry);
      })
      .filter(function (entry) {
        if (!entry || seen[entry]) {
          return false;
        }
        seen[entry] = true;
        return true;
      });
  }

  function getFriendUsernameLookup() {
    const data = getBootstrapData();
    const lookup = {};

    (data.friends || []).forEach(function (friend) {
      const username = normalizeUsernameValue(
        friend && friend.username
          ? friend.username
          : friend && friend.user && friend.user.username
            ? friend.user.username
            : ''
      );
      if (username) {
        lookup[username] = true;
      }
    });

    return lookup;
  }

  function validateGroupInviteUsernames(usernames) {
    const allowedLookup = getFriendUsernameLookup();
    const sessionUsername = normalizeUsernameValue(state.session && state.session.user ? state.session.user.username : '');
    const allowed = [];
    const disallowed = [];

    (usernames || []).forEach(function (username) {
      const normalizedUsername = normalizeUsernameValue(username);
      if (!normalizedUsername || normalizedUsername === sessionUsername) {
        return;
      }

      if (allowedLookup[normalizedUsername]) {
        allowed.push(normalizedUsername);
      } else {
        disallowed.push(normalizedUsername);
      }
    });

    return {
      allowed: allowed,
      disallowed: disallowed
    };
  }

  function openModal(element) {
    if (!element) {
      return;
    }
    element.hidden = false;
    element.classList.add('visible');
  }

  function closeModal(element) {
    if (!element) {
      return;
    }
    element.classList.remove('visible');
    element.hidden = true;
  }

  function openGroupCreateModal() {
    const elements = getElements();
    if (elements.chatGroupForm) {
      elements.chatGroupForm.reset();
    }
    state.pendingGroupAvatarFile = null;
    if (elements.chatGroupAvatarName) {
      elements.chatGroupAvatarName.textContent = 'No image selected';
    }
    openModal(elements.chatGroupModal);
  }

  function openGroupManageModal(room) {
    const elements = getElements();
    state.manageGroupRoomId = room.id;
    state.pendingManageGroupAvatarFile = null;

    if (elements.chatManageGroupNameInput) {
      elements.chatManageGroupNameInput.value = room.name || '';
    }
    if (elements.chatManageGroupUsersInput) {
      elements.chatManageGroupUsersInput.value = '';
    }
    if (elements.chatManageGroupAvatarName) {
      elements.chatManageGroupAvatarName.textContent = 'No image selected';
    }
    openModal(elements.chatGroupManageModal);
  }

  function openReportModal(message) {
    const elements = getElements();
    state.pendingReportMessage = message;
    if (elements.chatReportReasonInput) {
      elements.chatReportReasonInput.value = '';
    }
    if (elements.chatReportPreview) {
      elements.chatReportPreview.textContent = message.authorUsername + ': ' + (getMessagePreviewText(message) || '[Message unavailable]');
    }
    openModal(elements.chatReportModal);
  }

  async function handleSignup(event) {
    event.preventDefault();
    const elements = getElements();
    const username = sanitizeUsernameInputValue(elements.signupUsername ? elements.signupUsername.value : '');
    const usernameCandidates = dedupeStrings([username, normalizeUsernameValue(username)]);
    const password = elements.signupPassword ? elements.signupPassword.value : '';
    const passwordConfirm = elements.signupPasswordConfirm ? elements.signupPasswordConfirm.value : '';

    if (elements.signupUsername) {
      elements.signupUsername.value = username;
    }

    try {
      let response = null;
      let lastError = null;
      for (let i = 0; i < usernameCandidates.length; i += 1) {
        try {
          response = await api('/api/chat/signup', 'POST', {
            username: usernameCandidates[i],
            password: password,
            passwordConfirm: passwordConfirm
          });
          break;
        } catch (error) {
          lastError = error;
          const status = error && error.status ? error.status : 0;
          if (!(status === 400 || status === 404 || status === 422)) {
            break;
          }
        }
      }
      if (!response) {
        throw (lastError || new Error('Unable to create the account.'));
      }
      pb.authStore.save(response.token, response.record);
      await refreshSession();
      await loadBootstrap();
      await loadActiveRoom();
      setFeedback(elements.accountAuthFeedback, 'success', 'Account created.');
      if (window.switchTab) {
        window.switchTab('chat');
      }
    } catch (error) {
      setFeedback(elements.accountAuthFeedback, 'error', extractErrorMessage(error, 'Unable to create the account.'));
    }
  }

  async function handleLogin(event) {
    event.preventDefault();
    const elements = getElements();
    const username = sanitizeUsernameInputValue(elements.loginUsername ? elements.loginUsername.value : '');
    const usernameCandidates = dedupeStrings([username, normalizeUsernameValue(username)]);
    const password = elements.loginPassword ? elements.loginPassword.value : '';

    if (elements.loginUsername) {
      elements.loginUsername.value = username;
    }

    try {
      let response = null;
      let lastError = null;
      for (let i = 0; i < usernameCandidates.length; i += 1) {
        try {
          response = await api('/api/chat/login', 'POST', {
            username: usernameCandidates[i],
            password: password
          });
          break;
        } catch (error) {
          lastError = error;
          const status = error && error.status ? error.status : 0;
          if (!(status === 400 || status === 404 || status === 422)) {
            break;
          }
        }
      }
      if (!response) {
        throw (lastError || new Error('Unable to log in.'));
      }
      pb.authStore.save(response.token, response.record);
      await refreshSession();
      await loadBootstrap();
      await loadActiveRoom();
      setFeedback(elements.accountAuthFeedback, 'success', 'Logged in.');
      if (window.switchTab) {
        window.switchTab('chat');
      }
    } catch (error) {
      setFeedback(elements.accountAuthFeedback, 'error', extractErrorMessage(error, 'Unable to log in.'));
    }
  }

  async function handleChangeUsername(event) {
    event.preventDefault();
    const elements = getElements();
    const username = sanitizeUsernameInputValue(elements.accountUsernameInput ? elements.accountUsernameInput.value : '');
    if (elements.accountUsernameInput) {
      elements.accountUsernameInput.value = username;
    }

    if (!username) {
      setFeedback(elements.accountUsernameFeedback, 'error', 'Enter a valid username.');
      return;
    }

    try {
      const payloads = [
        { username: username },
        { newUsername: username },
        { username: username, newUsername: username },
        { username: normalizeUsernameValue(username), newUsername: username }
      ];
      let lastError = null;
      let updated = false;
      const endpoints = [
        '/api/chat/change-username',
        '/api/chat/username',
        '/api/account/username'
      ];

      for (let endpointIndex = 0; endpointIndex < endpoints.length && !updated; endpointIndex += 1) {
        const endpoint = endpoints[endpointIndex];
        for (let payloadIndex = 0; payloadIndex < payloads.length; payloadIndex += 1) {
          try {
            await api(endpoint, 'POST', payloads[payloadIndex]);
            updated = true;
            break;
          } catch (error) {
            lastError = error;
            const status = error && error.status ? error.status : 0;
            if (!(status === 400 || status === 404 || status === 422)) {
              break;
            }
          }
        }
      }

      if (!updated) {
        throw (lastError || new Error('Unable to update the username.'));
      }
      await refreshSession();
      await loadBootstrap();
      if (state.activeRoomId) {
        await loadActiveRoom();
      }
      setFeedback(elements.accountUsernameFeedback, 'success', 'Username updated.');
    } catch (error) {
      setFeedback(elements.accountUsernameFeedback, 'error', extractErrorMessage(error, 'Unable to update the username.'));
    }
  }

  async function handleChangePassword(event) {
    event.preventDefault();
    const elements = getElements();

    try {
      const response = await api('/api/chat/change-password', 'POST', {
        currentPassword: elements.accountCurrentPassword ? elements.accountCurrentPassword.value : '',
        newPassword: elements.accountNewPassword ? elements.accountNewPassword.value : '',
        newPasswordConfirm: elements.accountNewPasswordConfirm ? elements.accountNewPasswordConfirm.value : ''
      });
      pb.authStore.save(response.token, response.record);
      if (elements.accountPasswordForm) {
        elements.accountPasswordForm.reset();
      }
      setFeedback(elements.accountPasswordFeedback, 'success', 'Password updated.');
    } catch (error) {
      setFeedback(elements.accountPasswordFeedback, 'error', extractErrorMessage(error, 'Unable to change the password.'));
    }
  }

  async function handleDeleteAccount() {
    const elements = getElements();
    if (!window.confirm('Delete this account? DMs with friends will be removed and your messages will become DELETED USER.')) {
      return;
    }

    try {
      await api('/api/chat/delete-account', 'POST', {});
      markAccountLocked('deleted', 'Account deleted.');
      state.bootstrap = null;
      state.activeRoom = null;
      state.activeRoomId = '';
      state.transientDmRoom = null;
      renderAuthState();
      renderConversationList();
      renderFriendRequests();
      renderRoomChrome();
      renderMessages();
      setFeedback(elements.accountDangerFeedback, 'success', 'Account deleted.');
    } catch (error) {
      setFeedback(elements.accountDangerFeedback, 'error', extractErrorMessage(error, 'Unable to delete the account.'));
    }
  }

  function handleLogout() {
    pb.authStore.clear();
    state.session = null;
    state.bootstrap = null;
    state.activeRoom = null;
    state.activeRoomId = '';
    state.transientDmRoom = null;
    state.adminReports = [];
    state.modsDirectory = [];
    clearMentionSuggestions();
    clearPendingReply(false);
    clearPendingChatImage();
    clearFeedbacks();
    renderAuthState();
    renderConversationList();
    renderFriendRequests();
    renderRoomChrome();
    renderMessages();
    renderAdminReports();
    if (window.switchTab) {
      window.switchTab('account');
    }
  }

  async function handleSendMessage(event) {
    event.preventDefault();
    const elements = getElements();
    const message = collapseWhitespace(elements.chatMessageInput ? elements.chatMessageInput.value : '');
    const imageFile = state.pendingChatImageFile;
    const activeRoom = state.activeRoom && state.activeRoom.room ? state.activeRoom.room : null;

    if (isAccountLocked()) {
      setChatStatus('This account is locked. You can keep playing games, but chat actions are disabled.', 'danger');
      return;
    }

    if (isCurrentUsernameUnset()) {
      setChatStatus('Choose a username before sending messages.', 'warning');
      if (window.switchTab) {
        window.switchTab('account');
      }
      return;
    }

    if ((!message && !imageFile) || !state.activeRoomId) {
      return;
    }

    const safety = evaluateChatMessageSafety(message);
    if (!safety.ok) {
      setChatStatus(safety.reason || 'That message was blocked by the chat filter.', 'warning');
      await refreshSession();
      renderRoomChrome();
      renderMessages();
      return;
    }

    if (imageFile && !canAttachImagesToRoom(activeRoom)) {
      clearPendingChatImage();
      setChatStatus('Global chat does not allow image uploads.', 'warning');
      return;
    }

    if (elements.chatSendButton) {
      elements.chatSendButton.disabled = true;
    }
    if (elements.chatImageButton) {
      elements.chatImageButton.disabled = true;
    }

    try {
      let response = null;

      if (imageFile) {
        const formData = new FormData();
        formData.append('roomId', state.activeRoomId);
        formData.append('message', message);
        if (state.pendingReply && state.pendingReply.messageId) {
          formData.append('replyToMessageId', state.pendingReply.messageId);
        }
        formData.append('image', imageFile, imageFile.name);
        response = await api('/api/chat/room/send', 'POST', formData);
      } else {
        response = await api('/api/chat/room/send', 'POST', {
          roomId: state.activeRoomId,
          message: message,
          replyToMessageId: state.pendingReply && state.pendingReply.messageId ? state.pendingReply.messageId : ''
        });
      }

      if (elements.chatMessageInput) {
        elements.chatMessageInput.value = '';
      }
      clearMentionSuggestions();
      clearPendingReply(false);
      clearPendingChatImage();

      if (
        response &&
        response.record &&
        state.activeRoom &&
        state.activeRoom.room &&
        state.activeRoom.room.id === response.record.roomId
      ) {
        const alreadyPresent = Array.isArray(state.activeRoom.messages) && state.activeRoom.messages.some(function (entry) {
          return entry.id === response.record.id;
        });

        if (!alreadyPresent) {
          state.activeRoom.messages = (state.activeRoom.messages || []).concat([response.record]);
        }

        syncRoomSummaryFromState(state.activeRoom);
        renderRoomChrome();
        renderMessages();
        renderConversationList();
      }

      await refreshSession();
      await loadBootstrap();
      await loadActiveRoom();
    } catch (error) {
      if (error && error.data && error.data.moderation && state.session) {
        const moderation = Object.assign({}, state.session.moderation || {}, error.data.moderation);
        const muteUntilMs = moderation.muteUntil ? new Date(moderation.muteUntil).getTime() : 0;
        const banUntilMs = moderation.banUntil ? new Date(moderation.banUntil).getTime() : 0;
        moderation.isMuted = !!(muteUntilMs && muteUntilMs > nowMs());
        moderation.isBanned = !!(banUntilMs && banUntilMs > nowMs());
        state.session.moderation = moderation;
      }
      setChatStatus(extractErrorMessage(error, 'Unable to send the message.'), 'warning');
      await refreshSession();
      renderRoomChrome();
      await loadBootstrap();
      await loadActiveRoom();
    } finally {
      if (elements.chatSendButton) {
        elements.chatSendButton.disabled = false;
      }
      if (elements.chatImageButton) {
        elements.chatImageButton.disabled = false;
      }
    }
  }

  async function handleAddFriendRequest(event) {
    event.preventDefault();
    const elements = getElements();
    const username = sanitizeUsernameInputValue(elements.chatAddFriendInput ? elements.chatAddFriendInput.value : '');

    if (elements.chatAddFriendInput) {
      elements.chatAddFriendInput.value = username;
    }

    try {
      await api('/api/chat/friend-request', 'POST', { username: username });
      if (elements.chatAddFriendInput) {
        elements.chatAddFriendInput.value = '';
      }
      await loadBootstrap();
      setChatStatus('Friend request sent.', 'warning');
    } catch (error) {
      setChatStatus(extractErrorMessage(error, 'Unable to send that request.'), 'warning');
    }
  }

  async function submitGroupCreate(event) {
    event.preventDefault();
    const elements = getElements();

    try {
      const inviteValidation = validateGroupInviteUsernames(
        parseCommaSeparatedUsernames(elements.chatGroupUsersInput ? elements.chatGroupUsersInput.value : '')
      );
      if (inviteValidation.disallowed.length) {
        setChatStatus('Only friends can be added to group chats. Remove: ' + inviteValidation.disallowed.join(', '), 'warning');
        return;
      }

      const response = await api('/api/chat/group/create', 'POST', {
        name: elements.chatGroupNameInput ? elements.chatGroupNameInput.value : '',
        usernames: inviteValidation.allowed
      });

      if (response && response.room && state.pendingGroupAvatarFile) {
        const formData = new FormData();
        formData.append('roomId', response.room.id);
        formData.append('avatar', state.pendingGroupAvatarFile, state.pendingGroupAvatarFile.name || 'group-avatar.png');
        await api('/api/chat/group/avatar', 'POST', formData);
      }

      closeModal(elements.chatGroupModal);
      await loadBootstrap();
      state.activeView = 'groups';
      state.activeRoomId = response && response.room ? response.room.id : '';
      renderSidebarMeta();
      renderConversationList();
      renderFriendRequests();
      await loadActiveRoom();
    } catch (error) {
      setChatStatus(extractErrorMessage(error, 'Unable to create that group.'), 'warning');
    }
  }

  async function submitGroupManage(event) {
    event.preventDefault();
    const elements = getElements();

    try {
      const roomId = state.manageGroupRoomId;

      if (elements.chatManageGroupNameInput && collapseWhitespace(elements.chatManageGroupNameInput.value)) {
        await api('/api/chat/group/update', 'POST', {
          roomId: roomId,
          name: elements.chatManageGroupNameInput.value
        });
      }

      const inviteValidation = validateGroupInviteUsernames(
        parseCommaSeparatedUsernames(elements.chatManageGroupUsersInput ? elements.chatManageGroupUsersInput.value : '')
      );
      if (inviteValidation.disallowed.length) {
        setChatStatus('Only friends can be added to group chats. Remove: ' + inviteValidation.disallowed.join(', '), 'warning');
        return;
      }

      if (inviteValidation.allowed.length) {
        await api('/api/chat/group/add-members', 'POST', {
          roomId: roomId,
          usernames: inviteValidation.allowed
        });
      }

      if (state.pendingManageGroupAvatarFile) {
        const formData = new FormData();
        formData.append('roomId', roomId);
        formData.append('avatar', state.pendingManageGroupAvatarFile, state.pendingManageGroupAvatarFile.name || 'group-avatar.png');
        await api('/api/chat/group/avatar', 'POST', formData);
      }

      closeModal(elements.chatGroupManageModal);
      await loadBootstrap();
      await loadActiveRoom();
    } catch (error) {
      setChatStatus(extractErrorMessage(error, 'Unable to update that group.'), 'warning');
    }
  }

  async function submitReport(event) {
    event.preventDefault();
    const elements = getElements();
    if (!state.pendingReportMessage) {
      return;
    }

    try {
      await api('/api/chat/report', 'POST', {
        messageId: state.pendingReportMessage.id,
        reason: elements.chatReportReasonInput ? elements.chatReportReasonInput.value : ''
      });
      closeModal(elements.chatReportModal);
      state.pendingReportMessage = null;
      setChatStatus('Report submitted.', 'warning');
    } catch (error) {
      setChatStatus(extractErrorMessage(error, 'Unable to submit that report.'), 'warning');
    }
  }

  async function handleRequestAction(requestId, decision) {
    try {
      await api('/api/chat/friend-request/respond', 'POST', {
        requestId: requestId,
        decision: decision
      });
      await loadBootstrap();
    } catch (error) {
      setChatStatus(extractErrorMessage(error, 'Unable to update that request.'), 'warning');
    }
  }

  async function handleChatAction(action, dataset) {
    if (!action) {
      return;
    }

    if (action === 'friend-request') {
      try {
        await api('/api/chat/friend-request', 'POST', { username: dataset.username });
        await loadBootstrap();
        setChatStatus('Friend request sent.', 'warning');
      } catch (error) {
        setChatStatus(extractErrorMessage(error, 'Unable to send that request.'), 'warning');
      }
      return;
    }

    if (action === 'open-dm') {
      openDmWithUsername(dataset.username);
      return;
    }

    if (action === 'reply-message') {
      const messages = state.activeRoom && Array.isArray(state.activeRoom.messages) ? state.activeRoom.messages : [];
      const message = messages.find(function (entry) {
        return entry.id === dataset.messageId;
      });
      if (message) {
        setPendingReply(message);
      }
      return;
    }

    if (action === 'report-message') {
      const messages = state.activeRoom && Array.isArray(state.activeRoom.messages) ? state.activeRoom.messages : [];
      const message = messages.find(function (entry) {
        return entry.id === dataset.messageId;
      });
      if (message) {
        openReportModal(message);
      }
      return;
    }

    if (action === 'block-user') {
      try {
        await api('/api/chat/block', 'POST', { username: dataset.username });
        await loadBootstrap();
        if (state.activeView === 'dms') {
          state.activeRoomId = '';
          state.activeRoom = null;
        }
        renderConversationList();
        renderFriendRequests();
        renderRoomChrome();
        renderMessages();
      } catch (error) {
        setChatStatus(extractErrorMessage(error, 'Unable to block that user.'), 'warning');
      }
      return;
    }

    if (action.indexOf('admin-') === 0) {
      const adminMap = {
        'admin-delete-message': 'delete_message',
        'admin-delete-user-messages': 'delete_user_messages',
        'admin-timeout-user': 'timeout_user',
        'admin-ban-user': 'ban_user',
        'admin-reset-avatar': 'reset_avatar',
        'admin-reset-username': 'reset_username',
        'admin-delete-user': 'delete_user'
      };
      const adminAction = adminMap[action];
      const payload = {
        messageId: dataset.messageId || '',
        userId: dataset.userId || '',
        username: dataset.username || ''
      };

      if (adminAction === 'timeout_user') {
        payload.minutes = isOwner() ? '30' : '60';
      }

      if (adminAction === 'ban_user') {
        payload.days = isOwner() ? '3' : '2';
      }

      if (adminAction === 'delete_user_messages') {
        payload.limit = isOwner() ? '' : '300';
      }

      if (adminAction === 'reset_username') {
        payload.newUsername = 'unset_username';
      }

      const confirmMessage = adminAction === 'delete_user'
        ? 'Delete this account? Their messages will become DELETED USER.'
        : adminAction === 'delete_user_messages'
          ? (isOwner() ? 'Delete every message from this user?' : 'Delete this user\'s latest 300 messages?')
          : adminAction === 'reset_username'
            ? 'Reset this username to UNSET USERNAME?'
            : adminAction === 'reset_avatar'
              ? 'Reset this user\'s profile picture?'
              : '';

      const response = await runAdminAction(adminAction, payload, 'Action applied.', confirmMessage);
      if (response) {
        await loadBootstrap();
        await loadActiveRoom();
      }
    }
  }

  async function handleRoomAction(action, roomId) {
    if (!action || !roomId) {
      return;
    }

    try {
      if (action === 'manage-group') {
        const room = findRoomSummaryById(roomId);
        if (room) {
          openGroupManageModal(room);
        }
        return;
      }

      if (action === 'delete-group') {
        if (!window.confirm('Delete this group chat for everyone?')) {
          return;
        }
        await api('/api/chat/group/delete', 'POST', { roomId: roomId });
        state.activeRoomId = getBootstrapData().globalRoom ? getBootstrapData().globalRoom.id : '';
      }

      if (action === 'leave-group') {
        if (!window.confirm('Leave this group chat?')) {
          return;
        }
        await api('/api/chat/group/leave', 'POST', { roomId: roomId });
        state.activeRoomId = getBootstrapData().globalRoom ? getBootstrapData().globalRoom.id : '';
      }

      await loadBootstrap();
      await loadActiveRoom();
    } catch (error) {
      setChatStatus(extractErrorMessage(error, 'Unable to update that group.'), 'warning');
    }
  }

  async function handleUnblock(username) {
    try {
      await api('/api/chat/unblock', 'POST', { username: username });
      await loadBootstrap();
    } catch (error) {
      setChatStatus(extractErrorMessage(error, 'Unable to unblock that user.'), 'warning');
    }
  }

  async function handleFriendClick(username) {
    await openDmWithUsername(username);
  }

  async function handleConversationClick(roomId) {
    const elements = getElements();
    clearMentionSuggestions();
    clearPendingReply(false);
    clearPendingChatImage();
    state.openMessageMenuId = '';
    if (elements.chatMessageList) {
      elements.chatMessageList._userScrolledUp = false;
    }
    state.activeRoomId = roomId;
    await loadActiveRoom();
    renderConversationList();
  }

  async function handleAdminReportAction(reportId, action) {
    const elements = getElements();
    const select = elements.adminReportsList ? elements.adminReportsList.querySelector('[data-report-select="' + reportId + '"]') : null;
    const duration = elements.adminReportsList ? elements.adminReportsList.querySelector('[data-report-duration="' + reportId + '"]') : null;
    const unit = elements.adminReportsList ? elements.adminReportsList.querySelector('[data-report-unit="' + reportId + '"]') : null;
    const selectedAction = action === 'dismiss' ? 'dismiss' : (select ? select.value : 'timeout');
    let durationValue = duration ? duration.value : '';
    let durationUnit = unit ? unit.value : '';

    if (!canUseOwnerTools() && selectedAction === 'delete_account') {
      setFeedback(elements.adminFeedback, 'error', 'Mods cannot delete accounts.');
      return;
    }

    if (!canUseOwnerTools() && (selectedAction === 'timeout' || selectedAction === 'ban')) {
      let value = Math.max(1, parseInt(durationValue || (selectedAction === 'ban' ? '48' : '1'), 10) || 1);
      let selectedUnit = durationUnit || (selectedAction === 'ban' ? 'hours' : 'hours');
      if (selectedUnit === 'days') {
        value = Math.min(value, 2);
      } else if (selectedUnit === 'hours') {
        value = Math.min(value, 48);
      } else {
        value = Math.min(value, 48 * 60);
      }
      durationValue = String(value);
      durationUnit = selectedUnit;
      if (duration) {
        duration.value = durationValue;
      }
      if (unit) {
        unit.value = durationUnit;
      }
    }

    try {
      await api('/api/admin/report-action', 'POST', {
        reportId: reportId,
        action: selectedAction,
        durationValue: durationValue,
        durationUnit: durationUnit
      });
      await loadAdminReports();
      await refreshSession();
      await loadBootstrap();
      if (state.activeRoomId) {
        await loadActiveRoom();
      }
      setFeedback(elements.adminFeedback, 'success', 'Report action applied.');
    } catch (error) {
      setFeedback(elements.adminFeedback, 'error', extractErrorMessage(error, 'Unable to update that report.'));
    }
  }

  function closeAllMenusOnOutsideClick() {
  }

  function bindChatListEvents() {
    const elements = getElements();

    if (elements.chatModeTabs) {
      elements.chatModeTabs.addEventListener('click', function (event) {
        const button = event.target.closest('[data-chat-view]');
        if (!button) {
          return;
        }
        setActiveView(button.dataset.chatView || 'groups');
      });
    }

    if (elements.siteMentionToast) {
      elements.siteMentionToast.style.cursor = 'pointer';
      elements.siteMentionToast.addEventListener('click', function () {
        hideMentionToast(true);
        var roomId = state.mentionToastRoomId;
        var roomType = state.mentionToastRoomType;
        if (typeof switchTab === 'function') {
          switchTab('chat');
        }
        if (roomId) {
          if (roomType === 'dm') {
            state.activeView = 'dms';
          } else {
            state.activeView = 'groups';
          }
          state.activeRoomId = roomId;
          syncChatModeTabs(state.activeView);
          renderSidebarMeta();
          renderConversationList();
          renderFriendRequests();
          loadActiveRoom();
        }
      });
    }

    if (elements.chatSidebarPrimaryButton) {
      elements.chatSidebarPrimaryButton.addEventListener('click', openGroupCreateModal);
    }

    if (elements.chatConversationList) {
      elements.chatConversationList.addEventListener('click', function (event) {
        const friend = event.target.closest('[data-kind="friend"]');
        if (friend && friend.dataset.username) {
          handleFriendClick(friend.dataset.username);
          return;
        }

        const room = event.target.closest('[data-kind="room"]');
        if (room && room.dataset.id) {
          handleConversationClick(room.dataset.id);
        }
      });
    }

    if (elements.chatIncomingRequestsList) {
      elements.chatIncomingRequestsList.addEventListener('click', function (event) {
        const button = event.target.closest('[data-request-action]');
        if (!button) {
          return;
        }
        handleRequestAction(button.dataset.requestId || '', button.dataset.requestAction || '');
      });
    }

    if (elements.chatBlockedList) {
      elements.chatBlockedList.addEventListener('click', function (event) {
        const button = event.target.closest('[data-block-action="unblock"]');
        if (!button) {
          return;
        }
        handleUnblock(button.dataset.username || '');
      });
    }

    if (elements.chatMessageList) {
      elements.chatMessageList.addEventListener('click', function (event) {
        const toggle = event.target.closest('[data-chat-menu-toggle]');
        if (toggle) {
          const messageId = toggle.dataset.chatMenuToggle || '';
          state.openMessageMenuId = state.openMessageMenuId === messageId ? '' : messageId;
          renderMessages();
          return;
        }

        const button = event.target.closest('[data-chat-action]');
        if (!button) {
          return;
        }
        state.openMessageMenuId = '';
        handleChatAction(button.dataset.chatAction || '', button.dataset);
      });
      elements.chatMessageList.addEventListener('scroll', function () {
        const el = elements.chatMessageList;
        const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
        el._userScrolledUp = distanceFromBottom > 48;
      });
    }

    if (elements.chatRoomActions) {
      elements.chatRoomActions.addEventListener('click', function (event) {
        const button = event.target.closest('[data-room-action]');
        if (!button) {
          return;
        }
        handleRoomAction(button.dataset.roomAction || '', button.dataset.roomId || '');
      });
    }
  }

  function bindAccountEvents() {
    const elements = getElements();

    if (elements.accountSignupForm) {
      elements.accountSignupForm.addEventListener('submit', handleSignup);
    }

    if (elements.accountLoginForm) {
      elements.accountLoginForm.addEventListener('submit', handleLogin);
    }

    if (elements.accountUsernameForm) {
      elements.accountUsernameForm.addEventListener('submit', handleChangeUsername);
    }

    if (elements.accountPasswordForm) {
      elements.accountPasswordForm.addEventListener('submit', handleChangePassword);
    }

    if (elements.accountDeleteButton) {
      elements.accountDeleteButton.addEventListener('click', handleDeleteAccount);
    }

    if (elements.accountLogoutButton) {
      elements.accountLogoutButton.addEventListener('click', handleLogout);
    }

    if (elements.avatarUploadButton && elements.avatarUploadInput) {
      elements.avatarUploadButton.addEventListener('click', function () {
        elements.avatarUploadInput.click();
      });
    }

    if (elements.avatarUploadInput) {
      elements.avatarUploadInput.addEventListener('change', async function () {
        const file = elements.avatarUploadInput.files && elements.avatarUploadInput.files[0];
        if (!file) {
          return;
        }

        if (!/^image\/(png|jpeg|webp|gif)$/i.test(file.type || '')) {
          elements.avatarUploadInput.value = '';
          setFeedback(elements.accountAvatarFeedback, 'error', 'Use a PNG, JPG, WEBP, or GIF under 2 MB.');
          return;
        }

        if (file.size > 2 * 1024 * 1024) {
          elements.avatarUploadInput.value = '';
          setFeedback(elements.accountAvatarFeedback, 'error', 'Profile photos must be under 2 MB.');
          return;
        }

        if (/^image\/gif$/i.test(file.type || '')) {
          if (elements.avatarUploadButton) {
            elements.avatarUploadButton.disabled = true;
          }
          try {
            await uploadProfileAvatar(file, file.name || 'avatar.gif');
          } catch (error) {
            setFeedback(elements.accountAvatarFeedback, 'error', extractErrorMessage(error, 'Unable to upload that GIF.'));
          } finally {
            elements.avatarUploadInput.value = '';
            if (elements.avatarUploadButton) {
              elements.avatarUploadButton.disabled = !isAuthenticated() || !canUseAccountActions();
            }
          }
          return;
        }

        openCropperForFile(file, 'profile');
      });
    }
  }

  function bindAdminEvents() {
    const elements = getElements();

    if (elements.adminModsRefreshButton) {
      elements.adminModsRefreshButton.addEventListener('click', function () {
        loadModsDirectory();
      });
    }

    if (elements.adminModUsernameInput) {
      elements.adminModUsernameInput.addEventListener('input', function () {
        elements.adminModUsernameInput.value = sanitizeUsernameInputValue(elements.adminModUsernameInput.value);
      });
    }

    if (elements.adminTargetUsernameInput) {
      elements.adminTargetUsernameInput.addEventListener('input', function () {
        elements.adminTargetUsernameInput.value = sanitizeUsernameInputValue(elements.adminTargetUsernameInput.value);
      });
    }

    if (elements.adminRenameCurrentInput) {
      elements.adminRenameCurrentInput.addEventListener('input', function () {
        elements.adminRenameCurrentInput.value = sanitizeUsernameInputValue(elements.adminRenameCurrentInput.value);
      });
    }

    if (elements.adminRenameNewInput) {
      elements.adminRenameNewInput.addEventListener('input', function () {
        elements.adminRenameNewInput.value = sanitizeUsernameInputValue(elements.adminRenameNewInput.value);
      });
    }

    if (elements.adminAddModButton) {
      elements.adminAddModButton.addEventListener('click', async function () {
        const username = sanitizeUsernameInputValue(elements.adminModUsernameInput ? elements.adminModUsernameInput.value : '');
        if (isOwnerUsername(username)) { alert('Owner accounts are already protected.'); return; }
        const response = await runAdminAction('set_role', { username: username, role: 'mod' }, 'User added as mod.');
        if (!response) {
          return;
        }
        if (elements.adminModUsernameInput) {
          elements.adminModUsernameInput.value = '';
        }
        await refreshSession();
        await loadBootstrap();
        await loadModsDirectory();
      });
    }

    if (elements.adminRemoveModButton) {
      elements.adminRemoveModButton.addEventListener('click', async function () {
        const username = sanitizeUsernameInputValue(elements.adminModUsernameInput ? elements.adminModUsernameInput.value : '');
        if (isOwnerUsername(username)) { alert('Cannot demote an owner account.'); return; }
        const response = await runAdminAction('set_role', { username: username, role: 'user' }, 'Mod access removed.');
        if (!response) {
          return;
        }
        if (elements.adminModUsernameInput) {
          elements.adminModUsernameInput.value = '';
        }
        await refreshSession();
        await loadBootstrap();
        await loadModsDirectory();
      });
    }

    if (elements.adminBroadcastSetButton) {
      elements.adminBroadcastSetButton.addEventListener('click', function () {
        runAdminAction('set_broadcast', { message: elements.adminBroadcastInput ? elements.adminBroadcastInput.value : '' }, 'Broadcast updated.');
      });
    }

    if (elements.adminBroadcastClearButton) {
      elements.adminBroadcastClearButton.addEventListener('click', function () {
        runAdminAction('clear_broadcast', {}, 'Broadcast cleared.');
      });
    }

    if (elements.adminPinnedSetButton) {
      elements.adminPinnedSetButton.addEventListener('click', function () {
        runAdminAction('set_pinned_message', { message: elements.adminPinnedInput ? elements.adminPinnedInput.value : '' }, 'Pinned message updated.');
      });
    }

    if (elements.adminPinnedClearButton) {
      elements.adminPinnedClearButton.addEventListener('click', function () {
        runAdminAction('clear_pinned_message', {}, 'Pinned message cleared.');
      });
    }

    if (elements.adminWipeChatButton) {
      elements.adminWipeChatButton.addEventListener('click', function () {
        runAdminAction('wipe_chat', {}, 'Global chat wiped.', 'Wipe every active message from Global Chat?');
      });
    }

    if (elements.adminTimeoutUserButton) {
      elements.adminTimeoutUserButton.addEventListener('click', async function () {
        const username = sanitizeUsernameInputValue(elements.adminTargetUsernameInput ? elements.adminTargetUsernameInput.value : '');
        if (isOwnerUsername(username)) { alert('Cannot moderate an owner account.'); return; }
        const response = await runAdminAction('timeout_user', { username: username, minutes: '30' }, 'User timed out.');
        if (!response) {
          return;
        }
        await refreshSession();
        await loadBootstrap();
        if (state.activeRoomId) {
          await loadActiveRoom();
        }
      });
    }

    if (elements.adminBanUserButton) {
      elements.adminBanUserButton.addEventListener('click', async function () {
        const username = sanitizeUsernameInputValue(elements.adminTargetUsernameInput ? elements.adminTargetUsernameInput.value : '');
        if (isOwnerUsername(username)) { alert('Cannot moderate an owner account.'); return; }
        const response = await runAdminAction('ban_user', { username: username, days: '3' }, 'User banned.');
        if (!response) {
          return;
        }
        await refreshSession();
        await loadBootstrap();
        if (state.activeRoomId) {
          await loadActiveRoom();
        }
      });
    }

    if (elements.adminResetAvatarButton) {
      elements.adminResetAvatarButton.addEventListener('click', async function () {
        const username = sanitizeUsernameInputValue(elements.adminTargetUsernameInput ? elements.adminTargetUsernameInput.value : '');
        if (isOwnerUsername(username)) { alert('Cannot moderate an owner account.'); return; }
        const response = await runAdminAction('reset_avatar', { username: username }, 'Profile picture reset.', 'Reset this user\'s profile picture?');
        if (!response) {
          return;
        }
        await loadBootstrap();
        if (state.activeRoomId) {
          await loadActiveRoom();
        }
      });
    }

    if (elements.adminDeleteUserMessagesButton) {
      elements.adminDeleteUserMessagesButton.addEventListener('click', async function () {
        const username = sanitizeUsernameInputValue(elements.adminTargetUsernameInput ? elements.adminTargetUsernameInput.value : '');
        if (isOwnerUsername(username)) { alert('Cannot moderate an owner account.'); return; }
        const response = await runAdminAction('delete_user_messages', { username: username, limit: '300' }, 'User messages deleted.', 'Delete this user\'s latest 300 messages?');
        if (!response) {
          return;
        }
        await loadBootstrap();
        if (state.activeRoomId) {
          await loadActiveRoom();
        }
      });
    }

    if (elements.adminResetUsernameButton) {
      elements.adminResetUsernameButton.addEventListener('click', async function () {
        const username = sanitizeUsernameInputValue(elements.adminTargetUsernameInput ? elements.adminTargetUsernameInput.value : '');
        if (isOwnerUsername(username)) { alert('Cannot moderate an owner account.'); return; }
        const response = await runAdminAction('reset_username', { username: username, newUsername: 'unset_username' }, 'Username reset to UNSET USERNAME.', 'Reset this username to UNSET USERNAME?');
        if (!response) {
          return;
        }
        await refreshSession();
        await loadBootstrap();
        if (state.activeRoomId) {
          await loadActiveRoom();
        }
      });
    }

    if (elements.adminDeleteUserButton) {
      elements.adminDeleteUserButton.addEventListener('click', async function () {
        const username = sanitizeUsernameInputValue(elements.adminTargetUsernameInput ? elements.adminTargetUsernameInput.value : '');
        if (isOwnerUsername(username)) { alert('Cannot delete an owner account.'); return; }
        const response = await runAdminAction('delete_user', { username: username }, 'User account deleted.', 'Delete this user account?');
        if (!response) {
          return;
        }
        await refreshSession();
        await loadBootstrap();
        if (state.activeRoomId) {
          await loadActiveRoom();
        }
      });
    }

    if (elements.adminRenameUserButton) {
      elements.adminRenameUserButton.addEventListener('click', async function () {
        const response = await runAdminAction('rename_user', {
          currentUsername: elements.adminRenameCurrentInput ? elements.adminRenameCurrentInput.value : '',
          newUsername: elements.adminRenameNewInput ? elements.adminRenameNewInput.value : ''
        }, 'Username updated.');
        if (!response) {
          return;
        }
        await refreshSession();
        await loadBootstrap();
        if (state.activeRoomId) {
          await loadActiveRoom();
        }
      });
    }

    if (elements.adminChooseSoundButton && elements.adminSoundInput) {
      elements.adminChooseSoundButton.addEventListener('click', function () {
        elements.adminSoundInput.click();
      });
    }

    if (elements.adminChooseMediaButton && elements.adminMediaInput) {
      elements.adminChooseMediaButton.addEventListener('click', function () {
        elements.adminMediaInput.click();
      });
    }

    if (elements.adminSoundInput) {
      elements.adminSoundInput.addEventListener('change', async function () {
        const file = elements.adminSoundInput.files && elements.adminSoundInput.files[0];
        if (!file) {
          return;
        }
        const formData = new FormData();
        formData.append('sound', file, file.name);
        try {
          await api('/api/admin/upload-sound', 'POST', formData);
          if (elements.adminSoundName) {
            elements.adminSoundName.textContent = file.name;
          }
          setFeedback(elements.adminFeedback, 'success', 'Sound uploaded.');
        } catch (error) {
          setFeedback(elements.adminFeedback, 'error', extractErrorMessage(error, 'Unable to upload the sound.'));
        } finally {
          elements.adminSoundInput.value = '';
        }
      });
    }

    if (elements.adminMediaInput) {
      elements.adminMediaInput.addEventListener('change', async function () {
        const file = elements.adminMediaInput.files && elements.adminMediaInput.files[0];
        if (!file) {
          return;
        }
        const formData = new FormData();
        formData.append('media', file, file.name);
        try {
          await api('/api/admin/upload-media', 'POST', formData);
          if (elements.adminMediaName) {
            elements.adminMediaName.textContent = file.name;
          }
          setFeedback(elements.adminFeedback, 'success', 'Image broadcast uploaded.');
        } catch (error) {
          setFeedback(elements.adminFeedback, 'error', extractErrorMessage(error, 'Unable to upload the image.'));
        } finally {
          elements.adminMediaInput.value = '';
        }
      });
    }

    if (elements.adminPlaySoundButton) {
      elements.adminPlaySoundButton.addEventListener('click', async function () {
        const response = await runAdminAction('play_sound', {}, 'Sound triggered.');
        if (response) {
          await fetchSiteState();
        }
      });
    }

    if (elements.adminShowMediaButton) {
      elements.adminShowMediaButton.addEventListener('click', async function () {
        const response = await runAdminAction('show_media', {}, 'Image broadcast triggered.');
        if (response) {
          await fetchSiteState();
        }
      });
    }

    if (elements.adminFlashbangButton) {
      elements.adminFlashbangButton.addEventListener('click', async function () {
        const response = await runAdminAction('trigger_flashbang', {}, 'Flashbang triggered.');
        if (response) {
          await fetchSiteState();
        }
      });
    }

    if (elements.adminBustButton) {
      elements.adminBustButton.addEventListener('click', async function () {
        const response = await runAdminAction('trigger_bust', {}, 'Bust effect triggered.');
        if (response) {
          await fetchSiteState();
        }
      });
    }

    if (elements.adminRollButton) {
      elements.adminRollButton.addEventListener('click', function () {
        runAdminAction('trigger_roll', {}, 'Barrel roll triggered.');
      });
    }

    if (elements.adminNukeButton) {
      elements.adminNukeButton.addEventListener('click', function () {
        runAdminAction('trigger_nuke', {}, 'Nuke event triggered.');
      });
    }

    if (elements.adminReportsList) {
      elements.adminReportsList.addEventListener('click', function (event) {
        const button = event.target.closest('[data-report-action]');
        if (!button) {
          return;
        }
        handleAdminReportAction(button.dataset.reportId || '', button.dataset.reportAction || '');
      });
    }

    if (elements.adminReportsFilter) {
      elements.adminReportsFilter.addEventListener('change', function () {
        renderAdminReports();
      });
    }
  }

  function bindModalEvents() {
    const elements = getElements();

    if (elements.chatAddFriendForm) {
      elements.chatAddFriendForm.addEventListener('submit', handleAddFriendRequest);
    }

    if (elements.chatComposer) {
      elements.chatComposer.addEventListener('submit', handleSendMessage);
    }

    if (elements.chatMessageInput) {
      elements.chatMessageInput.addEventListener('input', function () {
        updateMentionSuggestions();
      });

      elements.chatMessageInput.addEventListener('keydown', function (event) {
        if (!state.mentionSuggestions.length) {
          return;
        }
        const hasMentionContext = !!getActiveMentionState();
        if (!hasMentionContext) {
          clearMentionSuggestions();
          return;
        }

        if (event.key === 'ArrowDown') {
          event.preventDefault();
          state.mentionSelectedIndex = (state.mentionSelectedIndex + 1) % state.mentionSuggestions.length;
          renderMentionSuggestions();
          return;
        }

        if (event.key === 'ArrowUp') {
          event.preventDefault();
          state.mentionSelectedIndex = (state.mentionSelectedIndex - 1 + state.mentionSuggestions.length) % state.mentionSuggestions.length;
          renderMentionSuggestions();
          return;
        }

        if (event.key === 'Enter' || event.key === 'Tab') {
          const selected = state.mentionSuggestions[state.mentionSelectedIndex];
          if (!selected) {
            return;
          }
          event.preventDefault();
          applyMentionSuggestion(selected.username || '');
          return;
        }

        if (event.key === 'Escape') {
          event.preventDefault();
          clearMentionSuggestions();
        }
      });

      elements.chatMessageInput.addEventListener('blur', function () {
        window.setTimeout(function () {
          const active = document.activeElement;
          if (!active || !active.closest || !active.closest('#chatMentionMenu')) {
            clearMentionSuggestions();
          }
        }, 120);
      });
    }

    if (elements.chatImageButton && elements.chatImageInput) {
      elements.chatImageButton.addEventListener('click', function () {
        if (!canAttachImagesToActiveRoom()) {
          clearPendingChatImage();
          setChatStatus('Global chat does not allow image uploads.', 'warning');
          return;
        }
        elements.chatImageInput.click();
      });
    }

    if (elements.chatImageInput) {
      elements.chatImageInput.addEventListener('change', function () {
        if (!canAttachImagesToActiveRoom()) {
          clearPendingChatImage();
          setChatStatus('Global chat does not allow image uploads.', 'warning');
          return;
        }

        const file = elements.chatImageInput.files && elements.chatImageInput.files[0];
        if (!file) {
          clearPendingChatImage();
          return;
        }

        if (!/^image\/(png|jpeg|webp|gif)$/i.test(file.type || '')) {
          clearPendingChatImage();
          setChatStatus('Use a PNG, JPG, WEBP, or GIF under 3 MB.', 'warning');
          return;
        }

        if (file.size > 3 * 1024 * 1024) {
          clearPendingChatImage();
          setChatStatus('Images must be under 3 MB.', 'warning');
          return;
        }

        state.pendingChatImageFile = file;
        renderChatComposerAttachmentState();
      });
    }

    if (elements.chatAttachmentClear) {
      elements.chatAttachmentClear.addEventListener('click', function () {
        clearPendingChatImage();
      });
    }

    if (elements.chatReplyClear) {
      elements.chatReplyClear.addEventListener('click', function () {
        clearPendingReply(true);
      });
    }

    if (elements.chatMentionMenu) {
      elements.chatMentionMenu.addEventListener('mousedown', function (event) {
        event.preventDefault();
      });
      elements.chatMentionMenu.addEventListener('click', function (event) {
        const button = event.target.closest('[data-mention-username]');
        if (!button) {
          return;
        }
        applyMentionSuggestion(button.dataset.mentionUsername || '');
      });
    }

    if (elements.chatGroupForm) {
      elements.chatGroupForm.addEventListener('submit', submitGroupCreate);
    }

    if (elements.chatGroupCancelButton) {
      elements.chatGroupCancelButton.addEventListener('click', function () {
        closeModal(elements.chatGroupModal);
      });
    }

    if (elements.chatGroupAvatarButton && elements.chatGroupAvatarInput) {
      elements.chatGroupAvatarButton.addEventListener('click', function () {
        elements.chatGroupAvatarInput.click();
      });
    }

    if (elements.chatGroupAvatarInput) {
      elements.chatGroupAvatarInput.addEventListener('change', function () {
        const file = elements.chatGroupAvatarInput.files && elements.chatGroupAvatarInput.files[0];
        if (file) {
          openCropperForFile(file, 'group-create');
        }
      });
    }

    if (elements.chatGroupManageForm) {
      elements.chatGroupManageForm.addEventListener('submit', submitGroupManage);
    }

    if (elements.chatManageGroupCancelButton) {
      elements.chatManageGroupCancelButton.addEventListener('click', function () {
        closeModal(elements.chatGroupManageModal);
      });
    }

    if (elements.chatManageGroupAvatarButton && elements.chatManageGroupAvatarInput) {
      elements.chatManageGroupAvatarButton.addEventListener('click', function () {
        elements.chatManageGroupAvatarInput.click();
      });
    }

    if (elements.chatManageGroupAvatarInput) {
      elements.chatManageGroupAvatarInput.addEventListener('change', function () {
        const file = elements.chatManageGroupAvatarInput.files && elements.chatManageGroupAvatarInput.files[0];
        if (file) {
          openCropperForFile(file, 'group-manage');
        }
      });
    }

    if (elements.chatReportForm) {
      elements.chatReportForm.addEventListener('submit', submitReport);
    }

    if (elements.chatReportCancelButton) {
      elements.chatReportCancelButton.addEventListener('click', function () {
        closeModal(elements.chatReportModal);
      });
    }

    if (elements.avatarCropCancel) {
      elements.avatarCropCancel.addEventListener('click', resetCropState);
    }

    if (elements.avatarCropApprove) {
      elements.avatarCropApprove.addEventListener('click', approveCropUpload);
    }

    if (elements.avatarCropZoom) {
      elements.avatarCropZoom.addEventListener('input', function () {
        state.crop.zoom = Number(elements.avatarCropZoom.value || 1);
        drawCropPreview();
      });
    }

    if (elements.avatarCropCanvas) {
      elements.avatarCropCanvas.addEventListener('pointerdown', function (event) {
        if (!state.crop.image) {
          return;
        }
        state.crop.dragging = true;
        state.crop.dragStartX = event.clientX;
        state.crop.dragStartY = event.clientY;
        state.crop.startOffsetX = state.crop.offsetX;
        state.crop.startOffsetY = state.crop.offsetY;
        elements.avatarCropCanvas.setPointerCapture(event.pointerId);
      });

      elements.avatarCropCanvas.addEventListener('pointermove', function (event) {
        if (!state.crop.dragging) {
          return;
        }
        state.crop.offsetX = state.crop.startOffsetX + (event.clientX - state.crop.dragStartX);
        state.crop.offsetY = state.crop.startOffsetY + (event.clientY - state.crop.dragStartY);
        drawCropPreview();
      });

      elements.avatarCropCanvas.addEventListener('pointerup', function () {
        state.crop.dragging = false;
      });

      elements.avatarCropCanvas.addEventListener('pointercancel', function () {
        state.crop.dragging = false;
      });
    }

    [elements.chatGroupModal, elements.chatGroupManageModal, elements.chatReportModal].forEach(function (modal) {
      if (!modal) {
        return;
      }
      modal.addEventListener('click', function (event) {
        if (event.target === modal) {
          closeModal(modal);
        }
      });
    });
  }

  function bindGlobalEvents() {
    document.addEventListener('click', closeAllMenusOnOutsideClick);
    window.addEventListener('app:switch-tab', function (event) {
      const nextTab = event && event.detail ? event.detail.tab : '';

      if (nextTab !== 'chat' && nextTab !== 'account' && nextTab !== 'video' && nextTab !== 'admin') {
        return;
      }

      refreshSession().then(function (session) {
        if (!session || !session.user) {
          return null;
        }

        if (nextTab === 'chat') {
          fetchSiteState();
          return loadBootstrap().then(function () {
            ensureActiveRoomFromBootstrap();
            if (state.activeRoomId) {
              return loadActiveRoom();
            }
            renderRoomChrome();
            renderMessages();
            return null;
          });
        }

        if (nextTab === 'admin' && isStaff()) {
          fetchSiteState();
          return loadAdminReports();
        }

        return null;
      }).catch(function () {
      });
    });

    document.addEventListener('visibilitychange', function () {
      if (!isDocumentVisible()) {
        return;
      }

      refreshSession().then(function (session) {
        if (!session || !session.user) {
          return null;
        }

        fetchSiteState();

        if (isChatSectionVisible()) {
          return loadBootstrap().then(function () {
            if (state.activeRoomId) {
              return loadActiveRoom();
            }
            return null;
          });
        }

        if (isAdminSectionVisible() && isStaff()) {
          return loadAdminReports();
        }

        return null;
      }).catch(function () {
      });
    });
  }

  async function initialize() {
    if (!pb) {
      return;
    }

    restoreAccountLock();
    clearFeedbacks();
    renderSidebarMeta();
    renderConversationList();
    renderFriendRequests();
    renderRoomChrome();
    renderMessages();

    await refreshSession();
    await fetchSiteState();

    if (isChatSectionVisible() && isAuthenticated()) {
      await loadBootstrap();
      ensureActiveRoomFromBootstrap();
      if (state.activeRoomId) {
        await loadActiveRoom();
      } else {
        renderRoomChrome();
        renderMessages();
      }
    }

    if (isAdminSectionVisible() && isStaff()) {
      await loadAdminReports();
    }
    if (isOwner()) {
      await loadModsDirectory();
    }

    scheduleBootstrapPoll();
    scheduleRoomPoll();
    scheduleSessionPoll();
    scheduleSiteStatePoll();
    scheduleAdminReportsPoll();
  }

  bindChatListEvents();
  bindAccountEvents();
  bindAdminEvents();
  bindModalEvents();
  bindGlobalEvents();
  initialize();
})();
