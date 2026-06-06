@import 'tailwindcss';

@theme {
  --font-sans: Inter, ui-sans-serif, system-ui, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji',
    'Segoe UI Symbol', 'Noto Color Emoji';

  /* Casino dark palette */
  --color-c-bg: #0f1923;
  --color-c-nav: #172233;
  --color-c-panel: #1a2c3d;
  --color-c-surface: #213447;
  --color-c-elevated: #2b4258;
  --color-c-input: #0b161f;
  --color-c-border: #2a3f55;
  --color-c-border-hover: #3d5a76;
  --color-c-text: #b1bad3;
  --color-c-text-muted: #557086;
}

@layer base {
  /* https://tailwindcss.com/docs/upgrade-guide#buttons-use-the-default-cursor */
  button:not(:disabled),
  [role='button']:not(:disabled) {
    cursor: pointer;
  }
}
