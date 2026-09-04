/**
 * Slim an n8n workflow JSON down to what a reel needs to draw it.
 *
 *   node tools/graph.js "<workflow.json>" <out-name>
 *
 * n8n stores the canvas position of every node, which is the whole reason this
 * works: the reel shows the graph laid out exactly as it looks in the editor,
 * not a diagram redrawn to look like one. Disabled nodes are kept and flagged -
 * they are on the canvas in n8n too, and quietly dropping them would make the
 * node count in the video disagree with the node count on screen in n8n.
 */
const fs = require('fs');
const path = require('path');

const src = process.argv[2];
const name = process.argv[3];
if (!src || !name) { console.error('usage: node tools/graph.js <workflow.json> <out-name>'); process.exit(1); }

const wf = JSON.parse(fs.readFileSync(src, 'utf8'));

const nodes = wf.nodes
  .filter((n) => n.type !== 'n8n-nodes-base.stickyNote')
  .map((n) => ({
    id: n.name,
    type: String(n.type || '').replace(/^n8n-nodes-base\./, '').replace(/^@n8n\/n8n-nodes-langchain\./, 'lc.'),
    x: n.position[0],
    y: n.position[1],
    disabled: Boolean(n.disabled),
  }));

const byId = new Set(nodes.map((n) => n.id));
const edges = [];
for (const [from, outs] of Object.entries(wf.connections || {})) {
  if (!byId.has(from)) continue;
  for (const branch of outs.main || []) {
    for (const c of branch || []) {
      // A dangling connection to a node that no longer exists is a real thing
      // in hand-edited workflows, and it would draw an edge into empty space.
      if (c && byId.has(c.node)) edges.push({ from, to: c.node });
    }
  }
}

const out = { name: wf.name || name, nodes, edges };
const file = path.join(__dirname, '..', 'src', 'reels', 'workflow-tour', `${name}.json`);
fs.writeFileSync(file, JSON.stringify(out, null, 1));

const xs = nodes.map((n) => n.x), ys = nodes.map((n) => n.y);
console.log(`${name}.json  ${nodes.length} nodes  ${edges.length} edges`);
console.log(`bounds  x ${Math.min(...xs)}..${Math.max(...xs)}   y ${Math.min(...ys)}..${Math.max(...ys)}`);
console.log('types  ', [...new Set(nodes.map((n) => n.type))].join(' '));
