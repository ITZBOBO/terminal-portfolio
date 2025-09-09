import React, { useState, useRef, useEffect } from 'react';

const SAMPLE_PROJECTS = [
  { name: "Freelance CRM", desc: "Client & project dashboard, invoice PDF, protected sessions", tech: ["React","Node.js","MongoDB"] },
  { name: "Scam Scanner AI", desc: "AI-based scanner for phishing & scams (prototype)", tech: ["Python","OpenAI"] },
  { name: "Portfolio 3D Card", desc: "Glowing 3D hover profile card", tech: ["Three.js","React"] }
];

function useAutoType(initialText, speed = 30) {
  const [text, setText] = useState('');
  useEffect(() => {
    let i = 0;
    const id = setInterval(() => {
      setText(initialText.slice(0, i));
      i++;
      if (i > initialText.length) clearInterval(id);
    }, speed);
    return () => clearInterval(id);
  }, [initialText, speed]);
  return text;
}

export default function Terminal() {
  const [lines, setLines] = useState([]);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState([]);
  const [histIdx, setHistIdx] = useState(-1);
  const [theme, setTheme] = useState('dark'); // dark or light
  const scrollRef = useRef(null);
  const welcome = "Welcome to Enoch's terminal portfolio. Type 'help' to get started.";
  const typedWelcome = useAutoType(welcome, 15);

  useEffect(() => {
    // show the initial typed welcome once complete
    if (typedWelcome === welcome) {
      pushLine({ type: 'info', text: welcome });
      pushLine({ type: 'hint', text: "Try: about · projects · contact · help" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typedWelcome]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lines]);

  function pushLine(line) {
    setLines(prev => [...prev, line]);
  }

  function handleCommand(raw) {
    const cmd = raw.trim();
    if (!cmd) return;
    pushLine({ type: 'command', text: `$ ${cmd}` });

    // add to history
    setHistory(h => [...h, cmd]);
    setHistIdx(-1);

    // Special easter egg
    if (cmd.toLowerCase() === 'sudo hire enoch') {
      pushLine({ type: 'success', text: 'Authenticating...' });
      setTimeout(() => {
        pushLine({ type: 'success', text: '🎉 Hired! Redirecting to interview scheduler...' });
      }, 1000);
      // fake animation
      return;
    }

    const parts = cmd.split(' ');
    const root = parts[0].toLowerCase();

    switch (root) {
      case 'help':
        pushLine({ type: 'info', text: "Commands: about · projects · contact · theme [dark|light] · resume · clear" });
        break;
      case 'about':
        pushLine({ type: 'info', text: "Enoch Agboola — Full-stack developer. Loves React, Node.js, Tailwind, and creative UIs." });
        pushLine({ type: 'info', text: "Open to freelance & full-time roles. Based in Nigeria." });
        break;
      case 'projects':
        SAMPLE_PROJECTS.forEach(p => {
          pushLine({ type: 'info', text: `${p.name} — ${p.desc} (Tech: ${p.tech.join(', ')})` });
        });
        pushLine({ type: 'info', text: "Tip: type 'projects github' to fetch live repos (placeholder)." });
        break;
      case 'contact':
        pushLine({ type: 'info', text: "Email: enoch@example.com · LinkedIn: linkedin.com/in/enoch" });
        break;
      case 'theme':
        if (parts[1] && (parts[1] === 'dark' || parts[1] === 'light')) {
          setTheme(parts[1]);
          pushLine({ type: 'info', text: `Theme switched to ${parts[1]}` });
        } else {
          pushLine({ type: 'error', text: "Usage: theme dark | theme light" });
        }
        break;
      case 'resume':
      case 'cat':
        pushLine({ type: 'info', text: "Downloading resume..." });
        // In real deploy, replace with real file link. Here we just show a message.
        break;
      case 'clear':
        setLines([]);
        break;
      default:
        pushLine({ type: 'error', text: `Command not found: ${root}. Type 'help' for commands.` });
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    handleCommand(input);
    setInput('');
  }

  function handleKeyDown(e) {
    if (e.key === 'ArrowUp') {
      if (history.length === 0) return;
      const newIdx = histIdx === -1 ? history.length - 1 : Math.max(0, histIdx - 1);
      setHistIdx(newIdx);
      setInput(history[newIdx]);
    } else if (e.key === 'ArrowDown') {
      if (history.length === 0) return;
      if (histIdx === -1) return;
      const newIdx = histIdx === history.length - 1 ? -1 : Math.min(history.length - 1, histIdx + 1);
      setHistIdx(newIdx);
      setInput(newIdx === -1 ? '' : history[newIdx]);
    } else if (e.key === 'Tab') {
      e.preventDefault();
      // simple tab completion for the main commands
      const cmds = ['help','about','projects','contact','resume','theme dark','theme light','clear','sudo hire enoch'];
      const match = cmds.find(c => c.startsWith(input));
      if (match) setInput(match);
    }
  }

  return (
    <div className={theme === 'dark' ? 'bg-gray-900 min-h-screen text-green-300 p-6' : 'bg-white min-h-screen text-gray-900 p-6'}>
      <div className="max-w-3xl mx-auto">
        <div className={theme === 'dark' ? 'bg-black rounded p-4 terminal-scroll shadow-lg' : 'bg-gray-100 rounded p-4 terminal-scroll shadow-lg'} ref={scrollRef}>
          {lines.length === 0 && typedWelcome !== welcome && (
            <div className="text-sm text-gray-400">Loading...</div>
          )}
          {lines.map((l, i) => (
            <div key={i} className="mb-2">
              {l.type === 'command' && <div className="text-green-400">{l.text}</div>}
              {l.type === 'info' && <div>{l.text}</div>}
              {l.type === 'hint' && <div className="text-gray-500 italic">{l.text}</div>}
              {l.type === 'error' && <div className="text-red-500">{l.text}</div>}
              {l.type === 'success' && <div className="text-green-400">{l.text}</div>}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="mt-4 flex items-center space-x-3">
          <div className="text-sm font-mono">{'>'}</div>
          <input
            className="flex-1 bg-transparent outline-none font-mono text-sm p-2"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
            placeholder="type a command (help)"
          />
          <button className="px-3 py-1 bg-gray-800 text-white rounded text-sm" onClick={handleSubmit}>Enter</button>
        </form>

        <div className="mt-4 text-xs text-gray-500">
          Tip: press <kbd>Tab</kbd> for completion, <kbd>↑</kbd>/<kbd>↓</kbd> for history.
        </div>
      </div>
    </div>
  );
}
