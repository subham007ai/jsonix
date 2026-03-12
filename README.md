# JSONix

> Seven precision JSON tools. Fast, private, free.

🔗 **[jsonix.dev](https://jsonix.dev)** — Live site

## Tools

| Tool | Description |
|------|-------------|
| JSON Formatter | Beautify raw JSON with precise indentation |
| JSON Validator | Find every error with plain English hints |
| JSON Minifier | Strip whitespace, reduce payload size |
| JSON → CSV | Convert arrays of objects to spreadsheets |
| JSON Diff | Compare two JSON structures visually |
| JSON Path Tester | Test JSONPath expressions in real time |
| Schema Validator | Validate JSON against a JSON Schema |

## Why JSONix

Most JSON tools either explain nothing when 
something breaks, or send your data to a server.
JSONix does neither.

- 🔒 **100% client-side** — nothing leaves your browser
- 🎯 **Plain English errors** — not "Unexpected token"
- ⚡ **Zero server latency** — runs entirely in your browser
- 🔗 **Shareable URLs** — share your JSON state instantly
- 🆓 **Free forever** — no account, no limits

## Tech Stack

- Next.js 14 App Router
- TypeScript
- CodeMirror 6
- Supabase (waitlist only)
- Vercel

## Running Locally

```bash
git clone https://github.com/subham007ai/jsonix.git
cd jsonix
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

Create a `.env.local` file in the root:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

These are only needed for the waitlist feature.
All JSON tools work without them.

## Contributing

Issues and PRs welcome.
Open an issue before building a large feature
so we can discuss direction first.

## License

MIT — see [LICENSE](./LICENSE)
