<script>
    import { browser } from '$app/environment';
    import { onDestroy } from 'svelte';

    export let data;

    let messages = [];
    let connectionStatus = 'connecting';
    let reconnectAttempts = 0;
    let maxReconnectAttempts = 5;
  let newMessage = '';
  let currentUserId = data?.currentUserId ?? null;

	function setupEventSource() {
		const eventSource = new EventSource('/chat-stream');

		eventSource.onopen = () => {
			connectionStatus = 'connected';
			reconnectAttempts = 0;
		};

		eventSource.onerror = () => {
			connectionStatus = 'disconnected';

			if (reconnectAttempts < maxReconnectAttempts) {
				connectionStatus = 'reconnecting';
				reconnectAttempts++;

				// Försök reconnecta efter delay
				setTimeout(() => {
					eventSource.close();
					setupEventSource();
				}, 1000 * reconnectAttempts); // Exponential backoff
			} else {
				connectionStatus = 'failed';
			}
		};

		return eventSource;
	}

    if (browser) {
        // Din uppgift: Skapa EventSource connection
        const eventSource = new EventSource('/chat-stream');

		eventSource.onopen = () => {
			// Vad ska hända när connection öppnas?
			connectionStatus = 'connected';
		};

		eventSource.onmessage = (event) => {
			// Vad ska hända när meddelande tas emot?
			// Tips: JSON.parse(event.data)
			// Tips: Uppdatera messages array
			try {
				// Hantera specialtyp från servern
				const eventData = JSON.parse(event.data);

				switch (eventData.type) {
					case 'connected':
						connectionStatus = 'connected';
						break;

					case 'new_message':
						messages = [...messages, eventData.message];
						break;

					case 'user_joined':
						messages = [
							...messages,
							{
								content: `${eventData.user?.username ?? 'En användare'} har anslutit`,
								createdAt: new Date().toISOString(),
								author: { username: 'system' }
							}
						];
						break;

					case 'user_left':
						messages = [
							...messages,
							{
								content: `${eventData.user?.username ?? 'En användare'} har lämnat`,
								createdAt: new Date().toISOString(),
								author: { username: 'system' }
							}
						];
						break;

					case 'initial_data':
						messages = eventData.messages ?? [];
						break;

					default:
						console.warn('Unknown event type:', eventData.type);
				}
			} catch (e) {
				console.error('Invalid SSE payload', e);
			}
		};

		eventSource.onerror = (error) => {
			// Vad ska hända vid fel?
			// Tips: Uppdatera connectionStatus
			console.error('EventSource error', error);
			connectionStatus = 'disconnected';
		};

    onDestroy(() => {
      eventSource.close();
      connectionStatus = 'closed';
    });
	}
</script>

<div class="chat-container">
	<!-- Channel header -->
	<div class="header">
		<div class="connection-status" 
			class:connecting={connectionStatus === 'connecting'}
			class:connected={connectionStatus === 'connected'}
			class:reconnecting={connectionStatus === 'reconnecting'}
			class:disconnected={connectionStatus === 'disconnected'}>
			<span class="status-dot"></span>
			<span class="status-text">
				{#if connectionStatus === 'connecting'}
					Connecting...
				{:else if connectionStatus === 'connected'}
					Connected
				{:else if connectionStatus === 'reconnecting'}
					Reconnecting...
				{:else}
					Disconnected
				{/if}
			</span>
		</div>
	</div>

	<!-- Messages area -->
	<div class="messages" role="log" aria-live="polite">
		{#each messages as message}
			<div class="message" 
				class:own-message={message.isMine || message.author?.id === currentUserId || message.user?.id === currentUserId || message.owner?.id === currentUserId}>
				<div class="avatar-container">
					{#if message.author?.profileImage ?? message.owner?.profileImage ?? message.user?.profileImage}
						<img 
							src={message.author?.profileImage ?? message.owner?.profileImage ?? message.user?.profileImage} 
							alt="avatar" 
							class="avatar"
						/>
					{:else}
						<div class="avatar-fallback">
							{(message.author?.username ?? message.owner?.username ?? message.user?.username ?? 'U').charAt(0).toUpperCase()}
						</div>
					{/if}
				</div>
				<div class="content">
					<div class="meta">
						<span class="username">
							{message.author?.username ?? message.owner?.username ?? message.user?.username ?? 'Unknown'}
						</span>
						<span class="timestamp">
							{new Date(message.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
						</span>
					</div>
					<div class="text">{message.content}</div>
				</div>
			</div>
		{/each}
	</div>

	<!-- Message input -->
	<form class="input-form" method="POST" action="?/sendMessage">
		<div class="input-wrapper">
			<input 
				name="message" 
				type="text" 
				bind:value={newMessage}
				placeholder="Message #general-chat"
				autocomplete="off"
				class="input-field"
			/>
			<button type="submit" class="send-button">
				<svg width="20" height="20" viewBox="0 0 24 24" fill="none">
					<path d="M2 21L23 12L2 3V10L17 12L2 14V21Z" fill="currentColor"/>
				</svg>
			</button>
		</div>
	</form>
</div>

<style>
	:root {
		--bg-primary: #36393f;
		--bg-secondary: #2f3136;
		--bg-tertiary: #202225;
		--bg-input: #40444b;
		--text-primary: #dcddde;
		--text-secondary: #72767d;
		--text-link: #00b0f4;
		--accent: #5865f2;
		--green: #3ba55d;
		--yellow: #faa61a;
		--red: #ed4245;
		--hover-overlay: rgba(4, 4, 5, 0.07);
	}

	* {
		box-sizing: border-box;
	}

	.chat-container {
		display: flex;
		flex-direction: column;
		height: 100vh;
		background: var(--bg-primary);
		color: var(--text-primary);
		font-family: "gg sans", "Noto Sans", "Helvetica Neue", Helvetica, Arial, sans-serif;
	}

	/* Header */
	.header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		height: 48px;
		padding: 0 16px;
		background: var(--bg-secondary);
		border-bottom: 1px solid rgba(0, 0, 0, 0.2);
		box-shadow: 0 1px 0 rgba(4, 4, 5, 0.2), 0 1.5px 0 rgba(6, 6, 7, 0.05), 0 2px 0 rgba(4, 4, 5, 0.05);
	}

	/* Connection Status */
	.connection-status {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 4px 8px;
		border-radius: 4px;
		font-size: 12px;
		font-weight: 500;
	}

	.status-dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: var(--text-secondary);
	}

	.connection-status.connected .status-dot {
		background: var(--green);
	}

	.connection-status.connecting .status-dot,
	.connection-status.reconnecting .status-dot {
		background: var(--yellow);
	}

	.connection-status.disconnected .status-dot {
		background: var(--red);
	}

	.status-text {
		color: var(--text-secondary);
	}

	/* Messages */
	.messages {
		flex: 1;
		overflow-y: auto;
		padding: 16px 0;
		display: flex;
		flex-direction: column;
	}

	.messages::-webkit-scrollbar {
		width: 16px;
	}

	.messages::-webkit-scrollbar-track {
		background: transparent;
	}

	.messages::-webkit-scrollbar-thumb {
		background-color: #202225;
		border: 4px solid var(--bg-primary);
		border-radius: 8px;
	}

	.messages::-webkit-scrollbar-thumb:hover {
		background-color: #18191c;
	}

	/* Message */
	.message {
		display: flex;
		padding: 2px 16px 2px 72px;
		position: relative;
		margin-top: 17px;
	}

	.message:hover {
		background: var(--hover-overlay);
	}

	.avatar-container {
		position: absolute;
		left: 16px;
		top: 0;
		width: 40px;
		height: 40px;
	}

	.avatar,
	.avatar-fallback {
		width: 40px;
		height: 40px;
		border-radius: 50%;
	}

	.avatar-fallback {
		background: var(--accent);
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: 600;
		font-size: 16px;
		color: white;
	}

	.content {
		flex: 1;
		min-width: 0;
	}

	.meta {
		display: flex;
		align-items: baseline;
		gap: 8px;
		margin-bottom: 2px;
	}

	.username {
		font-size: 16px;
		font-weight: 500;
		color: var(--text-primary);
		cursor: pointer;
	}

	.username:hover {
		text-decoration: underline;
	}

	.own-message .username {
		color: var(--accent);
	}

	.timestamp {
		font-size: 12px;
		color: var(--text-secondary);
		font-weight: 400;
	}

	.text {
		font-size: 16px;
		line-height: 1.375;
		color: var(--text-primary);
		word-wrap: break-word;
		white-space: pre-wrap;
	}

	/* Input Form */
	.input-form {
		padding: 0 16px 24px 16px;
	}

	.input-wrapper {
		background: var(--bg-input);
		border-radius: 8px;
		display: flex;
		align-items: center;
		padding: 0 16px;
	}

	.input-field {
		flex: 1;
		background: transparent;
		border: none;
		color: var(--text-primary);
		font-size: 15px;
		padding: 11px 0;
		outline: none;
		font-family: inherit;
	}

	.input-field::placeholder {
		color: var(--text-secondary);
	}

	.send-button {
		background: transparent;
		border: none;
		color: var(--text-secondary);
		cursor: pointer;
		padding: 8px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 4px;
		transition: all 0.17s ease;
	}

	.send-button:hover {
		color: var(--text-primary);
		background: rgba(255, 255, 255, 0.07);
	}

	/* Mobile Responsive */
	@media (max-width: 768px) {
		.header {
			height: 44px;
			padding: 0 12px;
		}

		.channel-name {
			font-size: 15px;
		}

		.message {
			padding: 2px 12px 2px 60px;
		}

		.avatar-container {
			left: 12px;
			width: 32px;
			height: 32px;
		}

		.avatar,
		.avatar-fallback {
			width: 32px;
			height: 32px;
			font-size: 14px;
		}

		.username {
			font-size: 15px;
		}

		.text {
			font-size: 15px;
		}

		.input-form {
			padding: 0 12px 16px 12px;
		}
	}
</style>