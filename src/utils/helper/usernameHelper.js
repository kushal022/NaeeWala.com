import prisma from "@/lib/prisma.ts";


function cleanup(str) {
  return str.toLowerCase().replace(/[^a-z0-9]/g, "").trim();
}

export async function generateUniqueUsername(fullName, email) {
  let first = "";
  let last = "";

  if (fullName) {
    const parts = fullName.trim().split(" ");
    first = cleanup(parts[0] || "");
    last = cleanup(parts[1] || "");

    // If no last name, fallback to email local-part
    if (!last) {
      last = cleanup(email.split("@")[0]);
    }
  } else {
    // fallback when fullName missing
    const local = cleanup(email.split("@")[0]);
    first = local;
    last = "";
  }

  // Base username patterns
  const candidates = [
    `${first}${last}`,          // kushaljangid
    `${first}.${last}`,         // kushal.jangid
    `${first}_${last}`,         // kushal_jangid
    `${first}${last.charAt(0)}`,// kushalj
    `${first.charAt(0)}${last}`,// kjangid
  ].filter(Boolean);

  // Try each candidate, then fallback to numeric increments
  for (let base of candidates) {
    const unique = await findAvailableUsername(base);
    if (unique) return unique;
  }

  // If all patterns taken, fallback to incremental numbers
  return await generateFallback(first, last);
}

async function findAvailableUsername(base) {
  const exists = await prisma.user.findUnique({ where: { username: base } });
  if (!exists) return base;
  return null;
}

async function generateFallback(first, last) {
  let base = `${first}${last}`;
  let counter = 1;

  while (true) {
    const username = `${base}${counter}`;
    const exists = await prisma.user.findUnique({ where: { username } });

    if (!exists) return username;
    counter++;
  }
}
