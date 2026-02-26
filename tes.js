const fs = require("fs");
const path = require("path");
const ignore = require("ignore");

const ig = ignore();
const gitignorePath = path.join(process.cwd(), ".gitignore");

if (fs.existsSync(gitignorePath)) {
    ig.add(fs.readFileSync(gitignorePath, "utf8"));
}

const output = [];

function generateTree(dir, prefix = "") {
    const items = fs.readdirSync(dir);

    const filtered = items.filter(item => {
        // skip yang diawali .
        if (item.startsWith(".")) return false;
        if (item === "tree.txt") return false;
        if (item === "node_modules/") return false;

        const fullPath = path.join(dir, item);
        const relativePath = path.relative(process.cwd(), fullPath);

        // skip yg ke-ignore git
        if (ig.ignores(relativePath)) return false;

        return true;
    });

    filtered.forEach((item, index) => {
        const fullPath = path.join(dir, item);
        const isLast = index === filtered.length - 1;
        const connector = isLast ? "└── " : "├── ";

        output.push(prefix + connector + item);

        if (fs.statSync(fullPath).isDirectory()) {
            const newPrefix = prefix + (isLast ? "    " : "│   ");
            generateTree(fullPath, newPrefix);
        }
    });
}

const rootName = path.basename(process.cwd());
output.push(rootName);
generateTree(process.cwd());
fs.writeFileSync("tree.txt", output.join("\n"));
