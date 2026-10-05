// [REQ-23] Demo data for the defense. Used only by seed/seed.js.
// Dates are "YYYY-MM-DD HH:mm" in local time. Group keys (e.g. 'ALG') link
// posts and messages to the groups defined below.

// One simple password for every demo account (stored hashed with bcrypt).
const DEMO_PASSWORD = 'Demo1234';

const users = [
  { username: 'alice', fullName: 'Alice Cohen', email: 'alice@example.com', institution: 'Technion', fieldOfStudy: 'Computer Science', bio: 'Second-year CS student. I like algorithms and clean code.' },
  { username: 'bob', fullName: 'Bob Levi', email: 'bob@example.com', institution: 'Technion', fieldOfStudy: 'Computer Science', bio: 'Algorithms enthusiast, competitive programming on weekends.' },
  { username: 'maya', fullName: 'Maya Friedman', email: 'maya@example.com', institution: 'Tel Aviv University', fieldOfStudy: 'Software Engineering', bio: 'Databases and web development. Always up for a study session.' },
  { username: 'daniel', fullName: 'Daniel Mizrahi', email: 'daniel@example.com', institution: 'Hebrew University', fieldOfStudy: 'Mathematics', bio: 'Math student, tutoring linear algebra and calculus.' },
  { username: 'noa', fullName: 'Noa Shapiro', email: 'noa@example.com', institution: 'Tel Aviv University', fieldOfStudy: 'Information Systems', bio: 'Front-end developer in the making. Organizer of the web workshop.' },
  { username: 'amit', fullName: 'Amit Peretz', email: 'amit@example.com', institution: 'Ben-Gurion University', fieldOfStudy: 'Computer Engineering', bio: 'Operating systems and low-level programming.' }
];

// owner + members (the owner is added as a member automatically)
const groups = [
  { key: 'LA', name: 'Linear Algebra 1 - Exam Prep', course: 'Linear Algebra 1', institution: 'Hebrew University', studyFormat: 'in-person', maxMembers: 6, owner: 'daniel', members: ['alice', 'noa'],
    description: 'Weekly problem-solving sessions before the final exam. Bring your homework questions.' },
  { key: 'DS', name: 'Data Structures Study Squad', course: 'Data Structures', institution: 'Technion', studyFormat: 'hybrid', maxMembers: 4, owner: 'alice', members: ['bob', 'maya', 'amit'],
    description: 'Trees, heaps, hash tables and graphs. We meet on Sundays, online when needed.' },
  { key: 'ALG', name: 'Algorithms Night Owls', course: 'Algorithms', institution: 'Technion', studyFormat: 'online', maxMembers: 8, owner: 'bob', members: ['alice', 'daniel'],
    description: 'Late-night online sessions solving algorithm problems and past exams.' },
  { key: 'DB', name: 'Databases & SQL Practice', course: 'Databases', institution: 'Tel Aviv University', studyFormat: 'online', maxMembers: 5, owner: 'maya', members: ['noa', 'alice'],
    description: 'SQL exercises, normalization and query optimization.' },
  { key: 'OS', name: 'Operating Systems Lab Buddies', course: 'Operating Systems', institution: 'Ben-Gurion University', studyFormat: 'in-person', maxMembers: 3, owner: 'amit', members: ['bob', 'maya'],
    description: 'Small lab group for the OS assignments: processes, threads and synchronization.' },
  { key: 'WEB', name: 'Web Development Workshop', course: 'Web Development', institution: 'Tel Aviv University', studyFormat: 'hybrid', maxMembers: 10, owner: 'noa', members: ['maya', 'amit', 'bob', 'alice'],
    description: 'Hands-on workshop: HTML, CSS, JavaScript, React and Node.js.' }
];

// [author, course, groupKey or null, date, title, content, videoUrl]
const posts = [
  ['alice', 'Data Structures', null, '2025-12-08 18:20', 'Big-O cheat sheet for the first exam',
    'Quick reference: array access O(1), linked list search O(n), binary search O(log n), merge sort O(n log n), bubble sort O(n^2).\nRemember that Big-O describes the growth rate, not the exact running time.'],
  ['daniel', 'Linear Algebra 1', 'LA', '2025-12-17 10:05', 'Row reduction step by step',
    'To solve a linear system, write the augmented matrix and use three row operations: swap two rows, multiply a row by a non-zero number, and add a multiple of one row to another. Continue until you reach row echelon form, then back-substitute.'],

  ['bob', 'Algorithms', 'ALG', '2026-01-06 21:40', 'Greedy vs dynamic programming - when to use which',
    'Greedy algorithms make the locally best choice and never look back, so they only work when the problem has the greedy-choice property (for example activity selection). Dynamic programming stores answers to overlapping subproblems and works when greedy fails, like 0/1 knapsack.'],
  ['maya', 'Databases', null, '2026-01-12 14:10', 'Normalization: 1NF, 2NF, 3NF explained',
    '1NF: every column holds atomic values. 2NF: 1NF plus no partial dependency on part of a composite key. 3NF: 2NF plus no transitive dependencies between non-key columns. Normalization reduces duplicated data and update anomalies.'],
  ['noa', 'Web Development', 'WEB', '2026-01-19 19:00', 'Our workshop plan for the semester',
    'Weeks 1-3: HTML and CSS. Weeks 4-6: JavaScript and the DOM. Weeks 7-9: React. Weeks 10-12: Node.js, Express and MongoDB. Final project: a small full-stack app built in pairs.'],
  ['amit', 'Operating Systems', null, '2026-01-27 16:45', 'Processes vs threads',
    'A process has its own address space; threads of the same process share memory and open files. Creating a thread is cheaper than creating a process, but shared memory means you need synchronization to avoid race conditions.'],

  ['alice', 'Data Structures', 'DS', '2026-02-03 17:30', 'Binary search trees: insertion and deletion',
    'Insertion: walk down from the root, go left if the key is smaller and right if it is bigger, and insert at the empty spot. Deletion has three cases: a leaf (just remove it), one child (replace the node by its child), two children (replace by the in-order successor).'],
  ['daniel', 'Linear Algebra 1', null, '2026-02-09 09:15', 'Determinants: properties you should memorize',
    'Swapping two rows flips the sign. Multiplying a row by k multiplies the determinant by k. Adding a multiple of one row to another does not change it. det(AB) = det(A)det(B), and A is invertible exactly when det(A) is not zero.'],
  ['bob', 'Algorithms', null, '2026-02-14 22:10', "Dijkstra's algorithm - full summary",
    "Dijkstra's algorithm finds the shortest paths from one source vertex to all other vertices in a weighted graph whose edge weights are all non-negative.\n\n" +
    'It keeps a tentative distance for every vertex (0 for the source, infinity for the rest) and a priority queue ordered by that distance. In every step it removes the vertex with the smallest tentative distance, marks it as final, and relaxes each outgoing edge: if going through the current vertex gives a shorter path to a neighbor, the neighbor\'s distance is updated.\n\n' +
    'With a binary heap the running time is O((V + E) log V). The algorithm fails with negative edge weights, because a vertex that was already finalized could later be reached by a cheaper path - use Bellman-Ford in that case.'],
  ['maya', 'Databases', 'DB', '2026-02-20 13:00', 'SQL JOIN types with examples',
    'INNER JOIN returns only matching rows from both tables. LEFT JOIN returns every row from the left table and NULLs where there is no match. RIGHT JOIN is the mirror image, and FULL OUTER JOIN keeps unmatched rows from both sides.'],
  ['amit', 'Web Development', null, '2026-02-26 20:25', 'Flexbox vs Grid',
    'Use Flexbox for one-dimensional layouts such as a navbar or a row of buttons. Use CSS Grid for two-dimensional layouts with rows and columns, like a photo gallery or a dashboard. They work great together.'],

  ['noa', 'Databases', 'DB', '2026-03-04 11:40', 'Indexes: why my query became 100x faster',
    'Our course project query scanned a table of 2 million rows. After adding an index on the student_id column, the database could jump straight to the matching rows instead of reading the whole table. Indexes speed up reads but make inserts a little slower.'],
  ['alice', 'Algorithms', 'ALG', '2026-03-15 21:05', 'Merge sort vs quick sort',
    'Merge sort is always O(n log n) and stable, but needs O(n) extra memory. Quick sort is usually faster in practice and sorts in place, but its worst case is O(n^2) when the pivots are bad. Random pivots make that worst case very unlikely.'],
  ['daniel', 'Calculus 1', null, '2026-03-23 08:50', 'Limits: common tricks',
    'For 0/0 forms try factoring, multiplying by the conjugate, or a known limit such as sin(x)/x -> 1. For infinity/infinity divide by the highest power of x. L\'Hopital\'s rule is allowed only after you show the form is indeterminate.'],

  ['bob', 'Data Structures', 'DS', '2026-04-02 18:00', 'Hash tables and collisions',
    'A hash function maps a key to a bucket. Two keys in the same bucket is a collision. Chaining keeps a list in each bucket; open addressing looks for the next free slot. Keep the load factor low and lookups stay O(1) on average.'],
  ['maya', 'Operating Systems', 'OS', '2026-04-09 15:20', 'Deadlock: the four Coffman conditions',
    'A deadlock can happen only if all four hold: mutual exclusion, hold and wait, no preemption, and circular wait. Breaking any one of them prevents deadlock - for example, always acquiring locks in the same global order removes circular wait.'],
  ['noa', 'Linear Algebra 1', 'LA', '2026-04-16 10:30', 'Eigenvalues intuition',
    'An eigenvector is a direction that the matrix only stretches, without rotating it. The eigenvalue is the stretch factor. To find them, solve det(A - lambda I) = 0, then plug every lambda back in to find its eigenvectors.'],
  ['amit', 'Data Structures', null, '2026-04-21 19:10', 'Heaps and priority queues',
    'A binary min-heap is a complete binary tree where every parent is smaller than its children. Insert and remove-min both take O(log n), and building a heap from an array takes only O(n). It is the standard way to implement a priority queue.'],
  ['alice', 'Web Development', 'WEB', '2026-04-28 17:45', 'Playing a video in React with HTML5 <video>',
    'For the workshop exercise I used the native <video> element with the controls attribute, and a React ref to add my own Play, Restart and speed buttons. The sample clip below is a short flower time-lapse - try 2x speed!',
    '/videos/flower.mp4'],

  ['maya', 'Databases', null, '2026-05-03 12:15', 'B-tree indexes in practice',
    'Most relational databases store an index as a B-tree. Because the tree is shallow and sorted, the database can find a key in a few disk reads and also answer range queries such as BETWEEN or ORDER BY on the indexed column efficiently.'],
  ['bob', 'Algorithms', 'ALG', '2026-05-07 22:30', 'BFS and DFS - when to use each',
    'BFS explores the graph level by level with a queue and finds the shortest path in an unweighted graph. DFS goes as deep as possible with a stack or recursion, and is the basis for topological sort, cycle detection and connected components.'],
  ['daniel', 'Linear Algebra 1', 'LA', '2026-05-12 09:40', 'Vector spaces and bases - summary',
    'A basis is a set of vectors that is linearly independent and spans the space. Every basis of the same space has the same number of vectors - that number is the dimension. The standard basis of R^3 is e1, e2, e3.'],
  ['amit', 'Operating Systems', 'OS', '2026-05-18 16:00', 'Paging and virtual memory',
    'Virtual memory is split into pages and physical memory into frames of the same size. The page table maps pages to frames. When a page is not in memory, a page fault occurs and the OS loads it from disk, maybe evicting another page with LRU or a similar policy.'],
  ['noa', 'Web Development', null, '2026-05-24 20:40', 'REST API design checklist',
    'Use nouns for resources (/posts, /groups), HTTP methods for actions (GET, POST, PUT, DELETE), clear status codes (400 bad input, 401 not logged in, 403 not allowed, 404 not found), and always validate input on the server.'],
  ['alice', 'Data Structures', null, '2026-05-29 18:35', 'AVL tree rotations',
    'An AVL tree keeps the height difference of every node at most 1. After an insert, an unbalanced node is fixed with a rotation: LL and RR cases need one rotation, LR and RL cases need two. This keeps search, insert and delete at O(log n).'],

  ['bob', 'Algorithms', null, '2026-06-02 21:15', 'Exam tips: proving algorithm correctness',
    'For loops, state a loop invariant and prove initialization, maintenance and termination. For greedy algorithms, use an exchange argument. For recursive algorithms, use induction on the input size. Practice writing these proofs before the exam!'],
  ['maya', 'Data Structures', 'DS', '2026-06-06 14:50', 'Exam practice: linked lists questions',
    'Three classic exam questions: reverse a singly linked list in place, find the middle node in one pass (slow and fast pointers), and detect a cycle (Floyd\'s algorithm). Try to solve each in O(n) time and O(1) extra memory.'],
  ['daniel', 'Calculus 1', null, '2026-06-10 10:10', 'Integration by parts - exam questions',
    'Integration by parts: the integral of u dv equals uv minus the integral of v du. Choose u with the LIATE order (logarithmic, inverse trig, algebraic, trig, exponential). Past exam questions usually combine it with substitution.'],
  ['noa', 'Databases', 'DB', '2026-06-14 13:25', 'Exam summary: transactions and ACID',
    'Atomicity: all or nothing. Consistency: a transaction moves the database from one valid state to another. Isolation: concurrent transactions do not see each other\'s partial work. Durability: committed data survives a crash.'],
  ['amit', 'Operating Systems', null, '2026-06-19 17:05', 'Scheduling algorithms comparison',
    'FCFS is simple but suffers from the convoy effect. SJF minimizes average waiting time but needs to know burst lengths. Round Robin gives every process a time slice and is fair for interactive systems. Priority scheduling can starve low-priority jobs.'],
  ['alice', 'Algorithms', 'ALG', '2026-06-23 20:00', 'Dynamic programming: knapsack walkthrough',
    'For 0/1 knapsack, dp[i][w] is the best value using the first i items with capacity w. Either skip item i (dp[i-1][w]) or take it (value[i] + dp[i-1][w - weight[i]]). The table has n * W cells, so the running time is O(nW).'],
  ['bob', 'Web Development', 'WEB', '2026-06-28 19:30', 'Exam prep: HTTP status codes',
    '200 OK, 201 Created, 400 Bad Request, 401 Unauthorized (not logged in), 403 Forbidden (logged in but not allowed), 404 Not Found, 409 Conflict (for example a duplicate username), 500 Internal Server Error.'],

  ['maya', 'Web Development', 'WEB', '2026-07-05 18:10', 'Async JavaScript: callbacks, promises, async/await',
    'Callbacks were the original way to handle async work but lead to nesting. Promises chain with then and catch. async/await is syntax on top of promises that reads like normal code - wrap it in try/catch to handle errors.'],
  ['daniel', 'Linear Algebra 1', null, '2026-07-14 11:20', 'Linear transformations - matrix representation',
    'Every linear transformation from R^n to R^m can be written as multiplication by an m x n matrix. The columns of the matrix are the images of the standard basis vectors, so to build the matrix just apply T to e1, e2 and so on.'],
  ['amit', 'Data Structures', 'DS', '2026-07-22 16:40', 'Graph representations: adjacency list vs matrix',
    'An adjacency matrix uses O(V^2) memory and answers "is there an edge?" in O(1). An adjacency list uses O(V + E) memory and is better for sparse graphs, which is why most graph algorithms use it.'],

  ['noa', 'Web Development', null, '2026-08-18 15:00', 'Summer project idea: study planner app',
    'Over the summer I want to build a study planner with React and Node.js: courses, deadlines and a weekly calendar. Here is the WebM version of the sample clip I used to test video support in Chrome and Firefox.',
    '/videos/flower.webm'],

  ['bob', 'Operating Systems', 'OS', '2026-09-03 21:50', 'Semaphores vs mutexes',
    'A mutex is a lock owned by one thread at a time - only the owner unlocks it. A semaphore is a counter: wait decrements it and blocks at zero, signal increments it. A counting semaphore can let N threads into a section at once.'],
  ['alice', 'Algorithms', null, '2026-09-10 19:25', 'Minimum spanning trees: Prim vs Kruskal',
    'Both find a minimum spanning tree. Kruskal sorts all edges and adds the cheapest edge that does not create a cycle (using Union-Find). Prim grows one tree from a start vertex using a priority queue. Kruskal is simpler for sparse graphs.'],
  ['maya', 'Databases', 'DB', '2026-09-17 12:40', 'Query optimization: reading EXPLAIN output',
    'Run EXPLAIN before a slow query to see the plan. A full table scan on a big table usually means a missing index. Look at the estimated rows and the join order, and check that filters use indexed columns.'],
  ['daniel', 'Algorithms', 'ALG', '2026-09-25 10:45', 'Recurrence relations and the Master Theorem',
    'For T(n) = aT(n/b) + f(n), compare f(n) with n^(log_b a). Merge sort: T(n) = 2T(n/2) + n gives O(n log n). Binary search: T(n) = T(n/2) + 1 gives O(log n). Not every recurrence fits the theorem, so practice the substitution method too.'],

  ['amit', 'Data Structures', 'DS', '2026-10-01 18:30', 'Tries for autocomplete',
    'A trie stores strings character by character, so all words with the same prefix share a path. Looking up a prefix takes O(length of the prefix), which makes tries perfect for autocomplete and spell checking.'],
  ['noa', 'Databases', null, '2026-10-02 14:00', 'NoSQL vs SQL: when to use MongoDB',
    'SQL databases use fixed schemas and joins, and are great for strongly related data. MongoDB stores flexible JSON-like documents, which fits data that changes shape often. Our StudyConnect project uses MongoDB with Mongoose schemas.'],
  ['alice', 'Algorithms', null, '2026-10-03 20:15', 'Topological sort explained',
    'A topological order lists the vertices of a DAG so every edge goes from earlier to later - like course prerequisites. Run DFS and add each vertex to the front of the list when it finishes, or use Kahn\'s algorithm with in-degrees.'],
  ['bob', 'Data Structures', null, '2026-10-04 08:30', 'Union-Find (disjoint sets)',
    'Union-Find keeps track of which elements are in the same set. With union by rank and path compression, both union and find run in almost constant time. It is the key data structure inside Kruskal\'s algorithm.']
];

// [groupKey, sender, date, text] - every sender is a member of that group
const messages = [
  ['ALG', 'bob', '2026-10-03 20:02', 'Hi all! Tonight we are solving past exam questions on shortest paths.'],
  ['ALG', 'alice', '2026-10-03 20:04', "Great, I'll bring my Dijkstra summary."],
  ['ALG', 'daniel', '2026-10-03 20:05', 'Can we also do one Bellman-Ford question? I always mix them up.'],
  ['ALG', 'bob', '2026-10-03 20:07', 'Sure. Rule of thumb: negative edges -> Bellman-Ford.'],
  ['ALG', 'alice', '2026-10-03 20:12', 'Question 3 from the 2025 exam is a nice one.'],
  ['ALG', 'daniel', '2026-10-03 20:20', 'Is the answer O((V+E) log V) with a heap?'],
  ['ALG', 'bob', '2026-10-03 20:21', 'Yes, exactly.'],
  ['ALG', 'alice', '2026-10-03 20:35', 'I uploaded a post about topological sort as well.'],
  ['ALG', 'daniel', '2026-10-03 20:40', 'Thanks! Same time next week?'],
  ['ALG', 'bob', '2026-10-03 20:41', 'Same time next week 👍'],

  ['DS', 'alice', '2026-10-04 17:00', 'Reminder: Sunday 18:00, room 3 or online.'],
  ['DS', 'maya', '2026-10-04 17:05', "I'll join online."],
  ['DS', 'amit', '2026-10-04 17:06', 'Can we cover tries? I wrote a post about them.'],
  ['DS', 'bob', '2026-10-04 17:10', 'And Union-Find please, it shows up in the algorithms course too.'],
  ['DS', 'alice', '2026-10-04 17:12', 'Deal: tries first, then Union-Find.'],
  ['DS', 'maya', '2026-10-04 17:20', 'Does anyone have the AVL rotations exercise?'],
  ['DS', 'alice', '2026-10-04 17:22', "It's in my post from May."],
  ['DS', 'amit', '2026-10-04 17:30', 'The group is full now, so let me know if someone wants my seat.'],
  ['DS', 'bob', '2026-10-04 17:31', 'Haha no, stay!'],

  ['WEB', 'noa', '2026-10-02 18:00', 'Welcome to week 6! Today: async JavaScript.'],
  ['WEB', 'maya', '2026-10-02 18:02', 'I posted a summary about promises and async/await.'],
  ['WEB', 'bob', '2026-10-02 18:05', 'Is fetch allowed in the final project or only jQuery AJAX?'],
  ['WEB', 'noa', '2026-10-02 18:06', 'Check the requirements doc - jQuery AJAX is required there.'],
  ['WEB', 'amit', '2026-10-02 18:10', 'Does the video exercise need custom controls?'],
  ['WEB', 'alice', '2026-10-02 18:12', 'I added Play, Restart and speed buttons with a React ref - see my post.'],
  ['WEB', 'noa', '2026-10-02 18:15', 'Nice work Alice!'],
  ['WEB', 'maya', '2026-10-02 18:30', 'See you next week.'],

  ['DB', 'maya', '2026-10-01 12:00', 'This week: indexes and EXPLAIN.'],
  ['DB', 'noa', '2026-10-01 12:03', 'My query got 100x faster with an index, I wrote about it.'],
  ['DB', 'alice', '2026-10-01 12:05', 'Can we also review normalization? 3NF confuses me.'],
  ['DB', 'maya', '2026-10-01 12:08', 'Sure, start with my normalization post from January.'],
  ['DB', 'noa', '2026-10-01 12:15', 'Thursday at 14:00 online?']
];

module.exports = { DEMO_PASSWORD, users, groups, posts, messages };
