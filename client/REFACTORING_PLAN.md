# Frontend Refactoring Plan

**Goal:** turn `client/` into a codebase the next maintainer can understand, change and test, without breaking the live game along the way.

**Baseline commit:** `0e7d99d` (branch `refactoring`), surveyed 2026-09-29. Line numbers below refer to that commit and will drift. Search by symbol, not by line.

---

## How to use this plan

- **One step = one commit, or one small PR.** Every step is sized to be done, verified and committed on its own. Do not start a step until the previous one is committed and green.
- **Tick the checkbox** and add a line to the [Status log](#status-log) when a step lands. Record anything surprising under the step, as a `> Note:`.
- **Each step is labelled** either `refactor` (no behaviour change) or `fix` (deliberate behaviour change).
  - Never mix the two in one commit.
  - If you find a bug while refactoring, **keep the bug**, add it to [Appendix B](#appendix-b--known-bugs-backlog) and fix it later in its own `fix` step. That way any regression can be traced to a single commit.
- **Pass the verification gates** (below) before committing. Each step says which gates apply.
- **Phases are ordered by dependency.** Steps inside a phase can usually be reordered. Phases 0 and 1 must come first. Phase 3 (App.tsx) must come before phases 4 to 7.
- **Pending branches.** See [Pending branches](#pending-branches). Check that table before steps that rewrite many existing files (phase 1, 2.4, phase 3).

### Pending branches

These were checked on 2026-09-29. Re-check with `git log main..<branch> --oneline -- client` before starting a gated step.

| Branch | Client changes | Decision |
|---|---|---|
| `origin/fix-bugs` | 2 lines in `Leaderboard.tsx` and `QuestionStatistics.tsx` | Merge later; **conflicts after 0.5** in both files. Resolve by re-applying the fix on the formatted code: in `Leaderboard.tsx`, delete the `socket` import and the `socket.emit("getLecturerStatistics")` in the Continue `onClick`; in `QuestionStatistics.tsx`, add `socket.emit("getLecturerStatistics")` right after `socket.on("statistics", …)` in the effect. Then run `pnpm format`. |
| `other-universities` | none (server only) | No conflict with this plan |
| `origin/add-helping-hand-powerup`, `origin/powerups-and-achievements` | ~1,000–1,300 lines each, mostly new `Game/PowerUps/` files, plus edits to `App.tsx`, `Game.tsx`, `Question.tsx` and `DifficultySelection`/`DifficultyCard`. They are based on a main that is 183 commits old (2025-03-30). | **Not being merged** (owner decision, 2026-09-29). The plan ignores them. |


### Verification gates

| Gate | Command (from `client/`) | Available from |
|---|---|---|
| **G1 Typecheck** | `pnpm typecheck` (added in step 0.1) | now; app code is already clean |
| **G2 Build** | `pnpm build` | now; it passes |
| **G3 Unit tests** | `pnpm test` (Vitest, single run; `pnpm test:watch` for watch mode) | step 0.3 |
| **G4 Lint** | `pnpm lint` (no *new* errors) | step 0.1 |
| **G5 E2E smoke** | `pnpm e2e` against docker compose | step 0.6 |
| **G6 Manual smoke** | the [checklist](#manual-smoke-checklist), for the flows the step touches | now |

Default for any step: **G1 + G2 + G3 + G4**.
- Also run **G5** when a step touches App.tsx, routing, socket handling, Game, Lobby or Lecturer screens.
- Also run **G6** when a step touches something G5 does not cover, such as visuals, animations, the lecturer platform, or the boat theme.

---

## Current state (baseline)

| Check | Result |
|---|---|
| `tsc --noEmit` | 180 errors, **all in `src/__tests__/`**; app code typechecks |
| `react-scripts build` | passes; one **674 kB gzipped** JS bundle, no code splitting |
| Tests | **29/29 suites fail to start** (`ReferenceError: global is not defined`); Jest environment conflict, see step 0.2 |
| Lint | cannot run; `eslint` and the plugins that `.eslintrc.js` references are not installed |
| Prettier | 165 files unformatted |
| CI | GitHub only builds Docker images on `main`; `.gitlab-ci.yml` is stale (repo moved to GitHub) |
| Toolchain | CRA 5 (deprecated), TypeScript 4.9, Docker builds with Node 20, no `.nvmrc` |

### Main structural problems

1. **`App.tsx` is a god component (740 lines).**
   - It has about 40 `useState`s, including all lecturer-platform data, lobby, round, score, question and timer state.
   - About 30 socket listeners are registered in one `useEffect(..., [])` and never removed. The handlers capture stale values (for example `isPlayer` inside `onJoinedGameInProgress` and `onRaceStarted`).
   - `updated-exercise` and `updated-topic` are registered twice. The second copy re-registers on every data change without cleanup, so handlers pile up.
   - `useTimer` re-renders the whole app every second. All ~15 context values are inline object literals, so every consumer re-renders every second too.
2. **Side effects run during render.**
   - `Game.tsx` adds `beforeunload`/`unload` window listeners and reassigns `window.onmessage` on every render, and emits `socket.emit("getMandatoryNum")` on every render. That is at least one emit and two leaked listeners per second.
3. **A lot of dead code.**
   - The open, multiple-choice and true/false question types, MathQuill (loaded twice), KaTeX, the spam cooldown, InfoModal, the countdown popups, CheckPoint, DecorationsEditor, TeamLeaderboard, CheckpointReached, `Waiting/Boat.tsx`, `testValues.ts`, unused maps and unused GhostService functions.
   - **The only live question path is the Grasple iframe with its `postMessage` bridge.**
4. **The socket contract has drifted.**
   - The client emits `getAverageFinalScore` and `getResults`, which the server does not handle.
   - It listens for `wrongAnswer`, `result` and `get-next-question`, which the server never emits.
   - The server emits `error`, `authenticated` and `ghost-trains`, and some go unhandled. See [Appendix C](#appendix-c--socket-event-contract-as-found).
5. **Types and helpers are duplicated.**
   - There are two `SharedUtils.ts` files.
   - `Exercise` ≈ `GraspleExercise`, `Study` ≈ `StudyElement`, `Topic` vs `LobbyTopic`.
   - `Point`/`Component` are defined three times.
   - Time formatting exists four times, notification config about 11 times, and Grasple URL parsing three times.
6. **Train and boat themes are duplicated, not parameterised.**
   - MainVehicle and GhostVehicle each have three near-identical render branches.
   - Theme strings are compared inconsistently (`"Train"` vs `.toLowerCase()`, one broken comparison).
   - The vehicle SVG paths are inlined five times.
7. **Several oversized components.**
   - `TopicElement.tsx` has 1336 lines, 34 `useState`s, 16 `useEffect`s and 7 dialogs. It relies on a fragile chain of 5 effects to save.
   - `LecturerPlatform.tsx`, `ExerciseElement.tsx`, `Rounds.tsx` and `InstructionSections.tsx` are also large.
8. **Contexts are poorly shaped.**
   - There are 16 contexts, and 8 of them have a single consumer.
   - `TimeContext` means "remaining" in some places and "elapsed" in others, depending on nesting depth.
   - `RaceDataContext.checkpoints` is always `[]`.
   - Context data (ghosts) is mutated in place.
9. **The UI libraries are fragmented.**
   - 4 notification systems, 3 to 4 modal systems, 2 tooltip libraries, 2 animation libraries and 3 icon sets.
   - MUI and Bootstrap are both loaded globally. `@mui/icons-material` is v7 while `@mui/material` is v5.
10. **Global CSS collides.**
    - About 45 plain CSS files with generic names (`.background`, `.back-btn`, `.selected`, `.text`, `.container`).
    - `@keyframes wave` and `fadePop` are defined twice, and `fadeIn` is used but never defined.
    - Inline SVG `<style>` blocks leak `.cls-*` classes globally.
11. **Almost no documentation.** The READMEs are generic CRA text and describe npm, although the project uses pnpm.

---

## Target architecture

The plan converges on the layout below. Folders are introduced in phase 2 and filled in during phases 3 to 7.

```
client/src/
  app/                 App.tsx (routes only), providers.tsx, routes.ts (path constants)
  api/
    socket.ts          typed Socket<ServerToClientEvents, ClientToServerEvents>
    events.ts          the event maps: the single source of truth for the socket contract
    http.ts            fetch wrapper (base URL, headers, error handling)
    lobby.ts           createLobby(), validateLobby()
  state/               one provider plus hook per domain (see phase 3)
    session/           lobbyId, role, teamName, theme, topic, study
    round/             duration, timer (isolated), started/finished flags
    question/          current Grasple exercise, mandatory count, difficulty availability, streaks
    score/             team score, average, accuracy, lap value
    lecturerData/      topics, exercises, studies, subjects, default teams, plus their actions
  features/
    home/  join/  lobby/  lecturerGame/  game/  questions/  race/  leaderboard/  statistics/  lecturerPlatform/  endGame/
  themes/              ThemeConfig interface; train/ and boat/ (sprites, maps, colours, backgrounds)
  shared/
    ui/                Notify, SearchField, EditableSection, Figure, ConfirmDialog …
    hooks/             useSocketEvent, useWindowSize, useInterval/useTimeout (with cleanup)
    utils/             time formatting, grasple URL parsing, shuffle, …
  types/               domain types: Exercise, Topic, Study, Subject, Ghost, Theme, Difficulty …
  assets/              img/ and fonts/ (moved from src/img, src/fonts)
```

**Principles:**
- **Components render. Hooks own effects. Pure functions own logic,** and pure functions get unit tests.
- **Only `api/` imports `socket`.** Components subscribe through `useSocketEvent` or a domain hook.
- **Behaviour that differs between themes comes from a `ThemeConfig`,** never from `if (theme === "Train")` checks.
- **Every context value is memoised,** and each context has one clear meaning.

---

## Phase 0: Safety net

*Nothing else is safe until this phase is done. The app currently has no working automated checks except `tsc` and `build`.*

### [x] 0.1 Toolchain pinning and scripts (`refactor`)
- Add `client/.nvmrc` with `20`, matching the Dockerfile.
- Add these scripts to `package.json`:
  - `typecheck`: `tsc --noEmit`. It should temporarily exclude `src/__tests__` until step 0.3.
  - `lint`: fix it so it actually runs.
- Add the ESLint packages that `.eslintrc.js` references as devDependencies: `eslint@8`, `@typescript-eslint/parser`, `@typescript-eslint/eslint-plugin`, `eslint-plugin-react`, `eslint-config-prettier`. Remove `eslint-config-standard-with-typescript`, which is unused.
- Turn on `no-unused-vars` (TS version) and `react-hooks/exhaustive-deps` as **warnings**, and record the baseline warning count here. Phase 1 uses these warnings as a to-do list.
- **Verify:** G1, G2; `pnpm lint` runs to completion.
- **Done when:** `pnpm typecheck`, `pnpm lint` and `pnpm build` all run locally with documented results.

> **Note (done 2026-09-29):**
> - **`typecheck`** uses `tsconfig.typecheck.json`, which excludes `src/__tests__`. Delete that file in 0.3 and point the script at `tsconfig.json`.
> - **`lint`** now targets `src/`. It exits 0 with **0 errors and 648 warnings**: 547 `no-unused-vars` and 61 `exhaustive-deps`; the rest are listed in 1.1.
> - **Six rules are temporarily set to `warn`** because they had existing violations. They are marked `TODO(REFACTORING_PLAN step 1.1)` in `.eslintrc.js`. `mathquill.min.js` is lint-ignored until 1.4 deletes it.
> - **Removed `package.json#eslintConfig`.** It was already ignored, since `.eslintrc.js` takes precedence, and the CRA dev-server lint is off via `.env`.
> - **Verified:** the production bundle hash is unchanged (`main.0b7c949d.js`).

### [x] 0.2 Make the test runner start (`refactor`)
> **Decision (2026-09-29):** use **Vitest** for tests now; do not patch CRA's Jest. The build stays on CRA until step 10.1. Vitest gets its own `vitest.config.ts` (jsdom, `src/setupTests.ts`, CSS and asset imports stubbed). The notes below explain why Jest is broken and which packages to remove.

- **Likely cause:** a conflicting Jest install.
  - `jest@^26` is a *runtime dependency*.
  - `babel-jest@^29` and `@babel/preset-env` are devDependencies.
  - CRA 5 bundles Jest 27.
  - A root `jest.config.js` also competes with the `jest` key in `package.json`.
- **Fix:**
  - Remove `jest`, `babel-jest`, `@babel/preset-env` and `socket.io-mock-ts` (its mocks are never injected, see 0.3).
  - Move `jest-junit`, `@types/*` and `typescript` to devDependencies.
  - Fold `jest.config.js` into the `package.json` `jest` key and delete the file.
- **If this doesn't make suites start within about an hour, switch plans:** do step 10.1 (Vite + Vitest) now, instead of patching CRA further.
- **Verify:** the suites *start*. They are allowed to fail on assertions at this point.
- **Done when:** `pnpm test` reports real pass/fail counts.

> **Note (done 2026-09-29):**
> - **Test setup:** `vitest.config.ts` (jsdom, globals, `css: false`, v8 coverage with the old Jest ignore paths), `src/vitest-env.d.ts` (the Vitest global types) and `setupTests.ts` (now imports `@testing-library/jest-dom/vitest`, bumped to v6).
> - **Scripts:** `test` = `vitest run`, `test:watch` = `vitest`, and `test:ci` adds coverage and JUnit output (`junit.xml`, already gitignored).
> - **Removed:** `jest`, `jest-junit`, `babel-jest`, `@babel/preset-env`, `@types/jest`, `jest.config.js` and the `package.json#jest` key.
> - **Tests:** `socket.io-mock-ts` moved to devDependencies until 0.3 deletes the tests that use it. In the tests, `jest.*` was renamed to `vi.*` mechanically.
> - **Result:** 29/29 files run, 85 tests, **45 pass and 40 fail**, all failures from stale tests. There are also 4 unhandled errors from tests hitting the real socket and `fetch` on `localhost:5000`; 0.3 mocks those.
> - **Full `tsc` including tests:** 180 → 74 errors.
> - **Verified:** lint is still 0 errors / 648 warnings, and the bundle hash is unchanged (`main.0b7c949d.js`).
> - **Still open:** `@types/node` is 16 while Vite wants 18 or later. It only produces a peer warning; bump it in 10.2.

### [x] 0.3 Triage the existing test suite (`refactor`)
The tests are about two years stale. Most assert UI that no longer exists, and several pass without testing anything because they call un-awaited `findBy*`.
- **Keep and fix:** `TracksPosition.test.ts`, `TracksStyle.test.ts` (pure logic, highest value), `Step`, `Round`, `TeamInformation`, `Login`, `JoinGame`, `Lobby`, `CheckPoint`, `Home` (update the title text).
- **Delete** tests for components that are about to be removed or are vacuous: MultipleChoice, TrueFalse, OpenQuestion, RaceTheme, Ghosts, Checkpoints, Tracks, StationDisplay, Tooltip, Waiting, Lecturer, LeaderBoard, Rounds, StartGame, Steps, Studies, Themes, DifficultySelection, Question. Their replacements are written in later phases, when each component is refactored.
- **Add `src/test/`** with:
  - `renderWithProviders()`, which wraps a component in a router and all contexts with overridable values.
  - `mockSocket`, a `vi.mock("../socket")` factory (the path becomes `../api/socket` after 2.3) with an `emit` spy and a `serverEmit(event, ...args)` helper to trigger client listeners.
- Remove the `src/__tests__` exclusion from `typecheck`: delete `tsconfig.typecheck.json` and point the script at `tsconfig.json`.
- Remove `socket.io-mock-ts` once no test imports it.
- **Verify:** G1 (including tests), G3 green.
- **Done when:** the suite is green, and every remaining test actually asserts something.

> **Note (done 2026-09-29):**
> - **Suite:** 10 files and 43 tests, all green, with 0 unhandled errors. All 19 test files on the delete list were deleted.
> - **Kept tests, rewritten with the helpers:**
>   - Login covers the back button, the password emit, a wrong password, and a correct password → `fetch` → `createLobby` → `/Lobby`.
>   - JoinGame covers invalid formats, an unknown lobby, and a valid lobby → `joinLobby` → `/Waiting`.
>   - Also Home, Lobby (the code padding, plus a player count driven by `new-player-joined`), Round, Step and TeamInformation.
>   - CheckPoint, TracksPosition and TracksStyle are unchanged apart from removed unused imports.
> - **The mocks are global:** `setupTests.ts` replaces `./socket` for *every* test with `src/test/mockSocket.ts`, which provides `mockSocket`, `serverEmit`, `listenerCount` and `resetMockSocket`. It also replaces `fetch` with a stub that rejects with a clear message unless the test calls `vi.mocked(fetch).mockResolvedValueOnce(...)`. No test can reach a real backend.
> - **Router and contexts:** `src/test/renderWithProviders.tsx` provides a `MemoryRouter`, optional context providers via `provide(Context, value)`, and `getPathname()` for navigation assertions.
> - **Typecheck:** `pnpm typecheck` now covers the tests (`tsconfig.typecheck.json` deleted). `socket.io-mock-ts` was removed.
> - **Password:** the old Login test hardcoded what looks like the real create-game password. The rewrite uses `"test-password"`, but the old value is still in git history (see Appendix D #3).
> - **Verified:** lint has 0 errors and 604 warnings, all in app code. The deleted tests took 44 warnings with them, and the test files now have none. The bundle hash is unchanged (`main.0b7c949d.js`).

### [x] 0.4 Characterisation tests for pure logic (`refactor`)
Pin the **current** behaviour, bugs included, of the logic that later phases will move. Mark known-wrong outputs with `// BUG (Appendix B #n)` so the later `fix` step flips the assertion.
- `RaceThemes/RaceService.ts`: `getRacePathObject`, `getNewTimeScoreIndex`, `formatRacePositionText`, `getColorForRaceLap`.
- `RaceThemes/Ghosts/GhostService.ts`: `initializeFrontendGhostObjects`, `getColorForStudy`, `currentGhostIsOpen`, `getGhostStyle`.
- `RaceThemes/PathPosition.ts`: `getCheckpointPosition`.
- `Game/GameService.ts`: `getRacePathSizeAndOffsetMargins` at each breakpoint.
- `CreateGame/Lecturer/LecturerService.ts`: `formatTime` and the other helpers.
- Grasple URL / iframe parsing: extract it verbatim from `ExerciseURLInput.tsx` into a function first, which is a pure move.
- **Verify:** G1, G3.

> **Note (done 2026-09-29):**
> - **Suite:** 16 → 17 files, 43 → **155 tests**, all green, and stable over 3 consecutive runs.
> - **New test files:** `RaceService`, `GhostService`, `PathPosition` (`getCheckpointPosition`), `GameService`, `LecturerService`, `grasple` and `ExerciseURLInput`. Expected values were derived by hand from the code, not copied from its output.
> - **Grasple parsing moved** into `src/utils/grasple.ts`: `extractIframeSrc`, `isGraspleExerciseUrl` and `extractGraspleExerciseId`. It replaces the inline copies in `ExerciseURLInput.tsx` and `TopicElement.tsx`.
>   - `extractGraspleExerciseId` returns the raw digits as a string, because `ExerciseURLInput` displays `#007` as written. Callers keep their own `parseInt`.
>   - The `ExerciseURLInput` render test passes unchanged against **both** the original and the refactored components, which proves the move preserved behaviour. The bundle is 3 B smaller (`main.65997c2d.js`).
> - **Coverage:** the config no longer excludes all of `src/utils/`, only `mathquill.min.js` and `testValues.ts`.
> - **New bugs pinned** as `BUG (Appendix B #n)` assertions: #33 to #36 are new, and #13, #22 and #24 are now pinned too.
> - **Also pinned, as observed behaviour only:**
>   - `getNewTimeScoreIndex` returns `currentIndex + 1` even before the current time point is reached, and runs past the end of the array once every point has passed. Its callers must be reviewed before deciding whether this is a bug.
>   - Diagonal path segments are measured by their x distance only. All maps are axis-aligned today.
> - **Verified:** lint is 0 errors / 604 warnings, unchanged.

### [x] 0.5 Format once (`refactor`)
- Run `pnpm prettier` over `client/` in a **single commit that contains nothing else**.
- Add that commit hash to a new `.git-blame-ignore-revs` at the repo root.
- Add a `format:check` script.
- **Verify:** G1, G2, G3; `git diff --stat` shows only whitespace and formatting changes.

> **Note (done 2026-09-29):**
> - **Config:** `.prettierignore` now also skips `pnpm-lock.yaml`, `coverage/`, `junit.xml`, the vendored `mathquill.min.js` / `mathquill.css`, and **all Markdown**. With `tabWidth: 4`, prettier re-indents every Markdown list to `-   ` and pads the tables.
> - **Scripts:** `format` and `format:check` replace the old `prettier` script.
> - **Result:** 175 files reformatted.
> - **Behaviour check:** the minified bundle changed by +43 B. Pretty-printing and diffing the before and after bundles showed 39 hunks:
>   - 37 are JSX text split around line breaks (`" At least "` → `" At least"`, `" "`). Their concatenated text was checked to be identical programmatically.
>   - The other 2 are the bundle's own file name in the license header and the source-map comment.
>   - **No behaviour change.**
> - **Gates:** G1 passes, lint is 0 errors / 604 warnings, 155/155 tests pass, and the build is green.
> - **Merge check:** test-merging against the formatted tree shows `origin/other-universities` merges cleanly. `origin/fix-bugs` conflicts in its two files; the resolution is in [Pending branches](#pending-branches).
> - **Commits:** the config (`.prettierignore`, `package.json`) and the reformat should be separate commits. Afterwards add the reformat commit's hash to `.git-blame-ignore-revs`. GitHub applies it automatically; locally, run `git config blame.ignoreRevsFile .git-blame-ignore-revs`.

### [ ] 0.6 End-to-end smoke test (`refactor`, new tooling)
This is the main guard for phase 3. The app is a multiplayer real-time game, and unit tests cannot catch broken socket or navigation wiring.
- **Setup:**
  - Add Playwright (`@playwright/test`) under `client/e2e/`.
  - Use `compose.yaml`, which runs Mongo, the backend and the frontend, plus a seed step. `server/json/scripts` and `server/json/*.json` hold the seed data. Seed at least one topic with at least one Grasple exercise and one study.
- **The scenario uses two browser contexts:**
  1. The lecturer logs in, creates a game, selects a topic, a study, the train theme and a name, and starts the lobby.
  2. The player joins with the lobby code and waits.
  3. The lecturer starts, and both reach TeamPreview, then `/Game` and `/Lecturer`.
  4. On the player page, simulate a Grasple answer by dispatching the `postMessage` payload the iframe would send: `{v:"0.0.2", namespace:"standalone", event:"checked_answer", properties:{correct:true, max_attempts:1}}`. The external Grasple site is never loaded.
  5. Assert that the score increases on both screens.
  6. End the round (short duration), then assert the leaderboard, statistics and end screen are reached.
- **Repeat once with the boat theme.**
- Add an `e2e` script and document it in the README. Stub out or allow-list the Grasple iframe URL so the test runs offline.
- **Verify:** G5 passes 3 runs in a row, so it is not flaky.
- **Done when:** `pnpm e2e` is a reliable gate.

### [ ] 0.7 CI (`refactor`)
- Add `.github/workflows/client-ci.yml`, running on PRs and pushes: install (frozen lockfile), typecheck, lint, test, build. E2E is optional; run it nightly or on a label if too slow.
- Delete `client/.gitlab-ci.yml`.
- **Verify:** CI is green on the PR.

---

## Phase 1: Remove dead code

*Low risk and high payoff: every later phase has less code to move. Each bullet group is one commit. Before deleting a symbol, confirm with `grep -rn` that it has no importers.*

### [ ] 1.1 Unused imports, variables and `console.log` (`refactor`)
- Use the lint warnings from 0.1 as the list, and autofix where possible.
- Fix the existing violations of the six rules that 0.1 temporarily downgraded, and set them back to `error`. Search `.eslintrc.js` for `TODO(REFACTORING_PLAN step 1.1)`.
  - `react/no-unescaped-entities`: 20; escaping gives identical rendered text.
  - `@typescript-eslint/no-loss-of-precision`: 9, in the map data; replace each with the value the runtime actually uses.
  - `restrict-plus-operands`: 4; `restrict-template-expressions`: 3.
  - `prefer-const`: 2.
  - `react-hooks/rules-of-hooks`: 2, in InfoModal. They disappear when 1.3 deletes it.
- Remove every `console.log`, including `APIRoutes.ts` (which logs the env var at import) and the `useEffect` in `Game.tsx` that exists only to log.
- Remove stray imports: `import { url } from "inspector"` (ExerciseElement), `import { title } from "process"` (Tooltip), `send` from `"process"` (DifficultyCard), `set` from react-hook-form, `faL`, `SECONDS`.
- **Verify:** default gates.

### [ ] 1.2 Unused files and components (`refactor`)
Delete:
- `RaceThemes/DecorationsEditor/`
- `Game/TeamStats/TeamLeaderboard/`
- `RaceThemes/CheckpointAnimation/`, which also removes the globally loaded `.text` / `.content` / `.hide` CSS
- `Waiting/Themes/Boat.tsx` + `Boat.css`, which removes the duplicate `@keyframes wave`
- `Waiting/Themes/train.svg`
- `utils/testValues.ts` (imported twice in App, used by nothing)
- `logo.svg`
- `reportWebVitals.ts` + the `web-vitals` dependency, unless someone actually uses them

Also:
- **`RaceThemes/Checkpoints/`:** only referenced from commented-out code. Delete it, and note in `docs/` that the checkpoint display was removed.
- **`CreateGame/Lecturer/CheckPoint.tsx`:** it never renders, because `showCP` is never true. Delete it together with the dead `showCheckPoint`/`timeUp` code in Lecturer.
- **`TrainMaps.ts`:** remove `mapOne` and `templateLoopMap`. Check whether `netherlandsMap1` is reachable. Only `trainMaps[1]` is used, so keep it only if it is planned as a selectable map, and write that decision down.
- **`GhostService.ts`:** remove `getGhostTeamFacultyColors`, `getGhostTeamColors`, `getShuffledGhotsColors`, `getHiglightColor` and `GhostColor`.
- **`LecturerService.ts`:** remove the commented-out `stations` and the unused `numberOfCheckpoints` and `themeCheckpoints`.
- **`APIRoutes.ts`:** remove `createLobby`, `validateLobbyId` and `getQuestionsRoute`, which are unused or wrong.

Finally, remove the tests for deleted components if any are still left after 0.3.
- **Verify:** default gates plus G5.

### [ ] 1.3 Dead state and branches inside live components (`refactor`)
- **`Game.tsx`:**
  - Remove `showPopup`, `countdown` and its interval, `modalType`, `modalAnswer`, `answeredQuestionType`, `Statistic`, `calculateStats` and the `result` listener, plus the three unused spring chains if InfoModal goes.
  - **InfoModal is never opened,** because every `setShowInfoModal(true)` is commented out. Delete InfoModal and the `hideQuestion` / `infoModalDisplayed` plumbing.
- **`Question.tsx`:** remove the dead modal and animation state, the unused props (`theme`, `calculateResponseTime`), the commented-out JSX, and about 15 unused imports.
- **`DifficultySelection` / `DifficultyCard`:**
  - Remove `modalText`, `easyCounter`, `handleEasyCardClick`, `updateDifficultyButtonStatus` and the `setEasyCounter` prop.
  - The spam-cooldown props are handled in 1.4.
- **`Lecturer.tsx`:** remove `roundFinished`, `gameEnds`, `showLeaderBoard`, the unrendered `teamScores`, the unused `ghostTeams` prop and the `get-all-scores` listener if nothing renders it.
- **`RaceTheme.tsx`:** remove the ignored props `setCheckpoint`/`showCheckPoint`, the constant state `nextCheckpoint`/`checkpointReached`, the commented-out blocks and the unused `usedTime`.
- **`RaceStatus.tsx`:** remove `lastCheckpointPassed`, `getRacePositionText` and `getNumberOfRaceLapsCompleted`, which are unused duplicates.
- **`GhostVehicle.tsx`:** remove the empty `playGhostAnimation` and the unused `RaceProgressContext` read. Then delete `RaceProgressContext` if nothing else reads it.
- **`TeamStats.tsx`:** remove the unused `buttonTopOffset`, `startStyle` and `teamStatsAnimation`.
- **`QuestionTrainBackground.tsx`:** its SVG is fully commented out. Either delete the component or restore the SVG, and **ask the product owner which**.
- **Commented-out code blocks everywhere:** delete them. Git has the history.
- **Verify:** default gates plus G5.

### [ ] 1.4 Remove the legacy question types (`refactor`)
The open, multiple-choice and true/false questions have been disabled end to end. The server's `checkAnswer` handler is commented out, and the client's JSX branch is commented out.
> **Decision (2026-09-29):** delete them. They will not be revived, and git keeps the history.
- **Delete:**
  - `Questions/MultipleChoiceQuestions/`, `Questions/OpenQuestion/` and `useRenderLatex.tsx` (if nothing else uses it)
  - `utils/mathquill.min.js`, `public/mathquill.css`, and the jQuery CDN and MathQuill `<script>` tags in `public/index.html`
  - `global.d.ts` (the `MathQuill: any` declaration)
  - The `react-mathquill`, `@types/react-mathquill` and `katex` dependencies, if nothing else uses them
- **Also remove:**
  - `IQuestion` and `QuestionContext`, which always hold the default value. Move the two live fields, `questionNumber` and `numberOfMandatory`, into GraspleQuestionContext.
  - The `get-next-question` listener and `onGetNewQuestion` in App.
  - The whole easy-question spam-cooldown mechanism: `calculateResponseTime`, `spamAnswerCounter`, `nonSpamAnswerCounter`, `incorrectAnswerStreak`, `easyQuestionsOnCooldown` and `CardCooldownGraphic`. It only ran from the deleted JSX, so it is unreachable. **Record in docs that it existed**, in case Grasple spam protection is wanted later.
- **Verify:** default gates plus G5. Check that the bundle got smaller and record the size.

### [ ] 1.5 Dead socket traffic (`refactor`)
- **Remove client emits the server ignores:** `getAverageFinalScore` (Lobby), `getResults` (Game).
- **Remove client listeners for events the server never emits:** `wrongAnswer`, `result` (if not already gone in 1.3), `get-next-question` (1.4), and the empty `answered-all-questions` handler.
- **Remove the discarded `fetch` of `/api/lobby/getRounds`** in `Steps.tsx`.
- Leave the server as it is. List its unhandled emits (`error`, `ghost-trains`) in Appendix C for the server-side cleanup.
- **Verify:** default gates plus G5.

### [ ] 1.6 Unused and misplaced dependencies (`refactor`)
- Run `npx depcheck` and confirm each result with grep.
- **Expected removals:**
  - `axios` (unused; all HTTP goes through `fetch`)
  - `bootstrap-modal`
  - `@react-navigation/native` and `@react-navigation/native-stack` (React Native, unused)
  - `react-time-sync`
  - `randomcolor` and `@types/randomcolor` (verify first)
  - `@types/css-modules`
  - Either `react-spring` or `@react-spring/web`: they are the same library, so keep one import path
  - `history`
  - `@mui/icons-material` if unused; if it is used, align it to v5
- **Move to devDependencies:** all `@types/*`, `typescript` and `jest-junit`.
- **Verify:** default gates plus G5. Run a fresh install from the frozen lockfile. Build the Docker image (`docker compose build frontend`).

---

## Phase 2: Foundations (types, constants, API layer, folders)

### [ ] 2.1 Domain types (`refactor`)
- Create `src/types/`: `exercise.ts`, `topic.ts`, `study.ts`, `subject.ts`, `ghost.ts`, `race.ts` (Point, Component, RacePathObject, RaceMap, Checkpoint, DecorationElement), `game.ts` (Streak, RoundInformation) and `index.ts`.
- **Merge the duplicates:**
  - `GraspleExercise` becomes `Exercise` (variants optional).
  - `StudyElement` becomes `Pick<Study, "name" | "abbreviation">`, or keep a named `LobbyStudy`.
  - Keep `LobbyTopic` separate but name it clearly, because `subject` is a string there and an object elsewhere.
- **`Point` / `Component`:** there are three copies (`SharedUtils`, `PathPosition`, `TracksStyle`). Keep one class.
- **Collect the scattered local interfaces:**
  - `IScore`: `Lecturer` and `LecturerService`
  - `checkpointTeams`: `Lecturer`, `CheckPoint` (deleted in 1.2) and `LecturerService`
  - `Teams`
  - `{topicName, roundDuration}`: `Lobby`, `Steps` and `Rounds`
- **Give `RaceMap.components` typed props:** replace `React.ComponentType<any>` / `props: any` with a discriminated union or a generic helper.
- Delete both `SharedUtils.ts` files. Rename `LecturerPlatform/FunctionUtils.ts` to something descriptive.
- **Verify:** default gates. This step changes only types and imports, so G1 is the main gate.

### [ ] 2.2 Enums and constants (`refactor`)
- **`Theme`:** `"Train" | "Boat"`, with a single `parseTheme()`/normaliser. Replace every string comparison of the theme. Keep the broken lowercase comparison in `Tracks.tsx:getCheckpointSprite` byte-for-byte and log it in Appendix B.
- **`Difficulty`:** `"easy" | "medium" | "hard"`, with display helpers. The server sends mixed case today.
- **`ROUTES`:** replace every string passed to `navigate("/…")` and every `<Route path>` with a constant.
- **Named constants** in `src/constants.ts` or per feature:
  - The 1920×1080 reference viewport and the 1536 decoration base width
  - `MAX_FAKE_TEAMS = 31`, `MAX_ROUNDS = 3`, and the round duration limits and default
  - `exercisesPerPage` / `topicsPerPage`
  - The skip delay of 20000 ms, toast durations, and the checkpoint banner time
  - The main team colours `#0021A7` / `#F8B700`
  - The z-index scale: replace the scattered `999999`/`99999`/`9999` with named layers
- **Verify:** default gates plus G5.

### [ ] 2.3 Typed socket and API layer (`refactor`)
- **`src/api/events.ts`:** define `ServerToClientEvents` and `ClientToServerEvents`, with argument types for every event in [Appendix C](#appendix-c--socket-event-contract-as-found).
- **`src/api/socket.ts`:** `io<…>(host, …)`, replacing `src/socket.ts`. Typos and dead events then fail to compile.
- **`src/api/http.ts`:** a small `request()` wrapper that sets the base URL and the ngrok header, checks `res.ok`, and returns typed JSON or throws.
- **`src/api/lobby.ts`:** `createLobby()` and `validateLobby(id)`, used by `Login.tsx` and `JoinGame.tsx`. Those files hardcode URLs today while `APIRoutes.ts` goes unused. Delete `utils/APIRoutes.ts`.
- **Add `src/shared/hooks/useSocketEvent.ts`:** `useSocketEvent(event, handler)`. It subscribes on mount, unsubscribes on unmount with `socket.off(event, handler)` (always passing the handler, never a bare `off(event)`), and keeps the latest handler in a ref so closures are never stale.
  - Unit-test it with the mock socket.
  - **Don't adopt it anywhere yet.** Phase 3 does that.
- Leave error *handling* behaviour as it is for now. Where `fetch` used to reject silently, keep it silent; showing errors comes in Appendix B.
- **Verify:** default gates plus G5.
- > Later, possibly as a server task: move `events.ts` to a shared package or copy it to `server/`, so both sides compile against one contract.

### [ ] 2.4 Folder restructure (`refactor`, pure moves)
- Use `git mv` only. **No logic edits** in these commits, apart from import paths, so git records clean renames.
- **Do one feature per commit,** in this order:
  1. `assets/` (img, fonts)
  2. `features/home`, `join`, `endGame`
  3. `features/lobby` (from `CreateGame/Lobby`, `CreateGame/Login`, `CreateGame.tsx`)
  4. `features/leaderboard` + `features/statistics` (out of `CreateGame/Lecturer`, since players use them too)
  5. `features/lecturerGame` (`CreateGame/Lecturer`)
  6. `features/game` + `features/questions`
  7. `features/race` (`RaceThemes`, minus the theme data)
  8. `themes/` (Maps, Sprites, SpecialDecorationComponents, theme backgrounds from `Waiting/Themes` and `Questions/Themes`)
  9. `features/lecturerPlatform`
  10. `contexts/` into `state/`, or into the feature that owns them
- **Optional:** add a `@/` path alias for absolute imports. CRA needs `baseUrl: "src"`; Vite needs an alias.
- **Verify after each move:** G1, G2, G3. After the last move, also G5.

---

## Phase 3: Decompose `App.tsx` (highest risk; G5 on every step)

*Goal: `App.tsx` contains only `<Providers><Routes/></Providers>`. Each domain provider owns its own state, socket listeners and actions, and memoises its context value.*
*Approach: plain React Context + `useReducer`. It adds no dependency and needs no new concepts from the next maintainer. If the per-second re-render keeps hurting after 3.5, reconsider `zustand` with selectors.*

### [ ] 3.1 `LecturerDataProvider` (`refactor`)
- **Moves:** `allTopics`, `allExercises`, `allStudies`, `allSubjects`, `allDefaultTeamData`, their six `all-*` / `updated-*` listeners, and the actions `updateExercise`, `updateTopic`, `deleteVariant`, `addDefaultTeams`, `deleteDefaultTeams` and `loadAll()` (the five `getAll*` emits).
- This is the least coupled domain, so start here to prove the pattern.
- `LecturerPlatform` and `TopicElement` call the actions from `useLecturerData()` instead of receiving props drilled from App.
- **Keep behaviour identical.** That includes the merge logic in `onGetUpdatedExercise` / `onGetUpdatedTopic`, which becomes a reducer case with a unit test.
- **Side effect:** this removes the duplicated, leaking `updated-*` registration. Behaviour stays the same because the handlers were idempotent, but note it in the commit.
- `StudiesContext` merges in here, since it duplicated `allStudies`.
- **Verify:** default gates, G5, and G6 for the lecturer platform (edit an exercise, edit a topic, add and remove fake teams).

### [ ] 3.2 `SessionProvider` (`refactor`)
- **Moves:** `lobbyId`, `isPlayer` (rename it `role: "player" | "lecturer"`), `teamName`, `theme`, `topic`, `study`, `raceMap` (derived from theme with `useMemo` instead of an effect), and the `round-information`, `themeChange` and `lobby-data` listeners. `LobbyDataContext` merges in.
- Also moves the lecturer-platform login flow (`access-granted` → load all → navigate), but it *keeps* the current reset-`loggedIn` behaviour.
- **Verify:** default gates plus G5.

### [ ] 3.3 `QuestionProvider` + `ScoreProvider` (`refactor`)
- **Question** moves: the current Grasple exercise, `questionNumber`, `numberOfMandatory`, `pointsToGain`, `difficultyAvailability`, `choosingDifficulty` (as a reducer flag with an explicit `acknowledgeDifficultyPrompt()` action, instead of exposing a setter as an event bus), and `streaks`.
  - Listeners: `get-next-grasple-question`, `mandatoryNum`, `disable-difficulty`, `chooseDifficulty`, `currentStreaks`, `ready-for-question-request`.
  - Contexts it replaces: GraspleQuestion, ChoosingDifficulty, DifficultyAvailability, Streak (and QuestionContext, if 1.4 didn't already).
- **Score** moves: `currentScore`, `averageTeamScore`, `currentAccuracy`, `fullLapScoreValue`, `currentIndividualScore`, `playerPlacement`, `showIndividualPlacements`.
  - Listeners: `score`, `race-track-end-score`, `your-placement`.
  - Contexts it replaces: `ScoreContext`, `PlayerPlacementContext`.
- **Verify:** default gates plus G5.

### [ ] 3.4 `RoundProvider` and the game-flow navigator (`refactor`)
- **Moves:** `roundDuration`, `roundStarted`, `isFirstRound`, `allRoundsFinished`, `stopShowingRace`, `ghostTeams`, `noGhostTeamsPresent`, `playerScoreBeforeReconnecting`, `userReconnectionAvailableTime`.
  - Listeners: `round-duration`, `round-started`, `race-started`, `game-ended`, `ghost-teams`, `joined-game-in-progress`, `blocked-user-reconnection`, `already-in-room`.
- **Put all socket-driven `navigate()` calls in one `useGameFlow()` hook,** and document it as a state diagram in `docs/GAME_FLOW.md`.
- **Keep the stale-closure behaviour on purpose.** For example, `onRaceStarted` → `gameStartHandler` sees `isPlayer === true` from mount time. Do *not* silently change it here. `useSocketEvent` would read the fresh value, which is a behaviour change, so:
  1. First reproduce the old behaviour explicitly, or confirm with G5 that the fresh value gives the same outcome.
  2. If it doesn't, keep the old behaviour and log it as a bug.
- **Verify:** default gates, G5, and G6 for reconnect (reload the player tab mid-round) and for "already in room" (two tabs).

### [ ] 3.5 `TimerProvider` (`refactor`)
- Move `useTimer` into its own provider. **Only** the time consumers re-render every second: TimeBar, RaceStatus, Ghosts, Lecturer and `saveTimeScore`.
- **Split `TimeContext` into `remainingSeconds` and `elapsedSeconds`.** Today `RaceStatus` re-provides the context with the opposite meaning. Replace that re-provide with the explicit value.
- Move the `saveTimeScore` every-30-seconds effect for the lecturer, and the `onExpire` handling, here.
- **Expected side effect:** because the Grasple question context no longer changes every second, the 20 s skip timer in `Question.tsx` may start working. That is a behaviour change, so:
  - Check it with G6.
  - Write it up in Appendix B #1 either way, and keep the old behaviour if the product owner prefers it.
- **Verify:** default gates, G5, G6 for a full round with the timer running out.

### [ ] 3.6 Routes and the slim `App.tsx` (`refactor`)
- `app/routes.tsx` holds the route table. `app/providers.tsx` composes the providers.
- Remove the duplicate `/Login` route, which is the same page as `/CreateGame` but without `isPlayerHandler(false)`. First check that nothing links to `/Login`.
- Consider `React.lazy` for `/LecturerPlatform` (MUI-heavy) to split the bundle, and record the bundle size.
- **Consider turning `<React.StrictMode>` back on.** It is commented out in `index.tsx`. With every listener now cleaned up, it should be safe, and it helps catch regressions. It double-invokes effects in development, so check that G5 still passes in dev mode.
- **Verify:** default gates plus G5.

---

## Phase 4: Game and questions

### [ ] 4.1 Move render-time side effects into effects (`fix`)
This changes behaviour, but only by removing leaks.
- **`Game.tsx`:**
  - `beforeunload` / `unload` listeners: move them into one effect with cleanup (a `useBeforeUnload` hook, also used by `Lobby` and `Lecturer`, which copy the same code).
  - `window.onmessage`: replace it with `addEventListener("message")` in a `useGrasplePostMessage(onChecked)` hook with cleanup, and add an **origin check** against the Grasple domain.
  - `socket.emit("getMandatoryNum")` on every render: move it to an effect on mount or on question change. Check with G5 that the mandatory count still updates.
- Use `useTimeout` / `useInterval` hooks with cleanup for every bare `setTimeout` listed in Appendix B #10.
- **Verify:** default gates plus G5. In DevTools, confirm the listener count stays flat over a round.

### [ ] 4.2 Split `Game.tsx` (`refactor`)
- `useAnswerFeedback()`: the three toast factories, using the shared `notify` from 6.1 or a local version for now.
- `useGrasplAttempts()`: the attempts, remaining tries and `onQuestionAnsweredCorrectly`/`Incorrectly` logic.
  - Replace the fragile `scoreToAdd` → effect → `score` chain with a reducer action `addPoints(n)`.
  - The hack at Game:301-305 ("reset `scoreToAdd` when `questionNumber > 2`") exists only because the effect doesn't fire twice for the same value.
  - Pin today's observable scores with a test before replacing the chain.
- `GameMinimap` component: the minimap SVG plus `RaceStatus`.
- `Game.tsx` ends up as a layout of about 100 lines.
- **Verify:** default gates plus G5.

### [ ] 4.3 `Question`, `QuestionOverlayBox` and `DifficultySelection` (`refactor`)
- `Question.tsx` becomes about 100 lines: a difficulty modal, the overlay boxes and the iframe.
- `QuestionOverlayBox`: the unused `openDuration` prop (3000 ms is hardcoded) becomes a real prop. Keep the seconds-vs-milliseconds mixup (Appendix B #7) as it is for now.
- `DifficultySelection`: the hardcoded base points (10/50/150) and tries (1/2/3) go into constants. **Note:** they duplicate the server's `scores` array. Log it in Appendix B, since ideally the server sends them.
- Unit tests for `DifficultyCard` (available, cleared, streak states) and for the `QuestionOverlayBox` open/close timing.
- **Verify:** default gates plus G5.

---

## Phase 5: Race rendering and themes

### [ ] 5.1 `ThemeConfig` (`refactor`)
- In `themes/types.ts`, define `ThemeConfig { id, maps, defaultMap, sprites, colors (minimap path, main vehicle), vehicle: { Image, sizingClass, layout }, backgrounds: { waiting, question, preview, race } }`.
- `themes/train/index.ts` and `themes/boat/index.ts` implement it. `useTheme()` returns the active config from the session.
- **Consolidate the sprites:** the 8 images shared by both themes go into `themes/shared/sprites.ts` with one naming scheme. `TrainThemeSprites.tsx` becomes `.ts`.
- Replace every `theme === "Train"` branch with a config lookup, **one component per commit**: Game backgrounds, Waiting, TeamPreview, RacePath, ThemeBackground, VehicleImage, Decoration.
- **Verify per commit:** default gates plus G6 for **both** themes. G5 runs both themes.

### [ ] 5.2 Viewport and scale hook (`refactor`)
- `useRaceViewport()` returns window size, `racePathSizing` and the 1920×1080 scale factors.
- It replaces the duplicated resize logic in `MainVehicle`, `GhostVehicle` and `Game`, and the unused `Tracks/WindowDimensions.tsx`.
- Keep the stale-sizing behaviour of `MainVehicle`'s handler (Appendix B), or confirm that fixing it has no visible effect.
- **Verify:** default gates plus G6: resize the window during a race, in both themes, on both the minimap and the lecturer view.

### [ ] 5.3 One vehicle component (`refactor`)
- `MainVehicle` and `GhostVehicle` each have three near-identical branches: train, boat, boat-minimap.
- Extract `<RaceVehicle position colors label zIndex variant />`. The per-theme differences (offsets, scale, rotation) come from `ThemeConfig.vehicle.layout`.
- `TeamPreview` reuses `VehicleImage` instead of inlining the SVG paths four times.
- **Verify:** default gates plus G6. Compare screenshots side by side (Playwright screenshots from G5) for the minimap and the lecturer view in both themes.

### [ ] 5.4 Stop mutating ghosts in place (`refactor`)
- `RaceStatus` writes `ghost.racePosition` / `ghost.isOpen`. `GhostVehicle` writes `ghost.animationStatus.*` / `ghost.lapsCompleted`. `TeamPreview` sorts `props.ghostTeams` in place.
- **Change:**
  - Ranking becomes a pure `rankRacers(ghosts, mainScore)`, used via `useMemo`.
  - Animation progress becomes local state in `GhostVehicle`, or a ref.
  - `TeamPreview` sorts a copy.
- **Extract `detectCheckpointPassed(prev, next, checkpoints, lapValue)`** from `RaceStatus` into a pure function with tests. It is the most intricate logic in the subtree.
- **Verify:** default gates, G5, G6 (ghost overtaking, lap completion text, checkpoint banner).

### [ ] 5.5 Decorations and map data (`refactor`)
- Move the 129-line height `switch` in `Decoration.tsx` into the decoration data, as a `height` field per `DecorationElement`.
- Share the `grassSprites` array, which is currently copied 6 times.
- **Make map jitter deterministic** (seeded) or compute it once in a function. Today `Math.random()` runs when the module loads.
- Move the Cow components pushed onto `netherlandsMap2` at import time into the map literal.
- **Special decorations:**
  - A generic `<PositionedSprite>` covers DuckSwim, SmallShark, Deer and Cruise.
  - A `useStaggeredCycle` hook covers the shared DolphinPod and Seals logic.
  - `WindmillPark` becomes a `.map()` over positions.
- **Verify:** default gates plus G6 (visual comparison of both maps).

### [ ] 5.6 Tests for race logic (`refactor`)
- Cover `RaceService`, ranking, checkpoint detection, `PathPosition`, and a render test of `RaceTheme` that uses `renderWithProviders` for each theme.
- **Verify:** G3.

---

## Phase 6: Lecturer platform

### [ ] 6.1 Shared building blocks (`refactor`)
- **`shared/ui/notify.ts`:** a single `notify.success/error/warning(title, msg)`. It replaces about 11 copy-pasted `Store.addNotification({...})` blocks, and one bottom-right outlier that should keep its position for now.
- **`shared/utils/grasple.ts`:** `parseGraspleEmbed(input)` and `extractExerciseId(url)`. They replace the three regex copies, and 0.4 already covers them with tests.
- **`shared/utils/time.ts`:** one `formatMmSs()`. It replaces the four copies, and keeps each caller's current output (including LecturerService's "00 seconds" quirk, which gets its own named function until it is fixed).
- **`shared/hooks/useDualListDnd`:** replaces the copy-paste between `Rounds.tsx` and `StudyEdit.tsx`.
- **`shared/ui/SearchField`:** replaces the four copies.
- **Verify:** default gates plus G6 (lecturer platform notifications, adding an exercise by URL).

### [ ] 6.2 Split `TopicElement.tsx` (1336 lines) (`refactor`, one sub-step per commit)
1. **Extract the 7 dialogs,** each as a controlled component in its own file: `ConfirmRemoveExerciseDialog`, `LinkExerciseDialog`, `ConfirmLinkExistingDialog`, `BatchImportDialog`, `CreateFakeTeamsDialog`, `DeleteFakeTeamsDialog`, `ManageVariantsDialog`.
2. **Extract `EditableSection`,** a view/edit/Discard/Save shell, then `TopicNameSection`, `TopicSubjectSection`, `TopicStudiesSection` and `FakeTeamsSection`.
3. **Extract the exercise list modes:**
   - `ExerciseListDefault`, `MandatoryReorderList` and `VariantsList`, behind a `mode: "view" | "edit" | "reorder" | "variants"` union.
   - Pass `exercise: Exercise` to `ExerciseElement` instead of 15 separate props copied three times.
4. **Replace the 5-effect save chain** (`saveChanges` → `newTopicData` → `unsavedChanges` → `saveTopicChanges` → `onUpdateTopic`) with a `useTopicDraft(topic)` reducer that exposes `draft`, `isDirty`, `update*()`, `save()` and `discard()`.
   - **Write a test first** that pins the current save payload for common edits.
   - This step removes the "boolean trigger prop" pattern (`saveChanges` passed to StudyEdit).
- **Verify after each sub-step:** default gates plus G6. The lecturer-platform checklist must be done in full after sub-step 4.

### [ ] 6.3 `LecturerPlatform.tsx` and `ExerciseElement.tsx` (`refactor`)
- **`LecturerPlatform`:**
  - Split into `LecturerAppBar`, `TopicsTab` and `ExercisesTab`.
  - A `usePaginatedSearch(items, predicate, perPage)` hook replaces the derived state held in effects. Keep the pagination-count bug for now (Appendix B).
  - Move `ExistingExercisesContext` into `features/lecturerPlatform/`.
- **`ExerciseElement`:**
  - Compute `isEditing` once. It is repeated nine times today.
  - Split `ExerciseHeader`, `ExerciseReadView` and `ExerciseEditForm`.
  - Separate `IndependentExerciseCard` (the Exercises tab) from `TopicExerciseRow`.
- **Verify:** default gates plus G6.

### [ ] 6.4 Instructions content (`refactor`)
- Split `InstructionSections.tsx` (620 lines) into one file per top-level section.
- Add a `<Figure src caption>` component with automatic numbering. The hardcoded figure numbers are already wrong: "Figure 13" appears twice, and "Figure 4" comes after 24.
- Add a `<Para>` wrapper component.
- Make `Instructions.tsx`'s navigation recursive instead of copying it per level.
- Fix the typos and add `rel="noopener noreferrer"`. These are content fixes; note them in the commit.
- **Verify:** default gates plus G6 (the Instructions tab renders, and navigation scrolls to each section).

---

## Phase 7: Lobby, lecturer game screen, leaderboard

### [ ] 7.1 Lobby flow (`refactor`)
- **`Rounds.tsx` (371 lines):** split into `SelectedRoundsList`, `RoundDurationPicker`, `RoundsFilterToolbar` and `AvailableRoundsGrid`. Also:
  - Move `SUBJECT_COLORS` into a `useSubjectColors` hook.
  - Remove the `let currentSubject` that is mutated during render.
  - Replace `window.alert` with `notify`.
- **`Steps.tsx`:** stop mutating `completedSteps` in place. That is a potential behaviour change, so check that step completion still renders correctly with G6.
- **Prop drilling:** `allowIndividualPlacements` and the study filter can come from `SessionProvider` instead.
- **Verify:** default gates plus G5.

### [ ] 7.2 Lecturer screen and leaderboard (`refactor`)
- **`Lecturer.tsx`:** use `useSocketEvent` for `get-checkpoints`, which is never removed today. The hardcoded 10-minute assumption goes into Appendix B.
- **`Leaderboard`:** it lives in `features/leaderboard`, from 2.4. Replace the `[props]` dependency, and replace the clickable `<div>`s with buttons (accessibility).
- **`QuestionStatistics`:** guard the `JSON.parse` call. Keep behaviour identical on bad data, which today means a crash, so log the crash in Appendix B.
- **Verify:** default gates plus G5.

---

## Phase 8: UI library and styling consolidation

*Each step removes one library. Do it component by component and remove the dependency in the last commit.*

### [ ] 8.1 One notification system
- The `notify` wrapper from 6.1 is the only caller, so switching is a one-file change.
- **Recommendation: keep `react-toastify`.** It is the most actively maintained option, and one `<ToastContainer>` goes in `app/`, instead of the current one per screen.
- Remove `react-notifications-component` and replace `window.alert`.
- **Verify:** G6, triggering every notification at least once.

### [ ] 8.2 One modal and dialog system
- Use MUI `Dialog` everywhere. Replace the `react-bootstrap` Modal (`WarningModal`) and `react-modal` (`Waiting`).
- Remove `react-bootstrap`, `react-modal` and `@types/react-modal`.

### [ ] 8.3 One tooltip library and one icon set
- **Tooltips:** use MUI `Tooltip` and remove `react-tooltip`. This also fixes the duplicate global tooltip ids.
- **Icons:** use FontAwesome, which is used most, and remove `react-icons` and `@mui/icons-material` if unused.

### [ ] 8.4 CSS isolation
- Convert component CSS to **CSS Modules** (`X.module.css`), which CRA and Vite support natively. **Start with the colliding classes:** `.background`, `.back-btn`, `.selected`, `.text`, `.container` (a carousel class that clashes with Bootstrap), `.leaderboard-item`, `@keyframes wave` / `fadePop`, and the missing `fadeIn`.
- Move the inline-SVG `<style>` blocks (`.cls-*`) into the SVGs as attributes, or import the SVGs as components.
- Add CSS variables in `index.css` for the colour palette and the z-index scale from 2.2.
- Delete the empty `Decorations.css`.
- **Verify per file:** G6 visual check in both themes.

### [ ] 8.5 (Optional) Remove global Bootstrap CSS
- Only Bootstrap's utility and grid classes are still used.
- Replace them with MUI `Box`/`Stack` or small module classes, then remove `bootstrap` and its global import in `index.tsx`.
- **High visual risk.** Do it last and screen by screen.

### [ ] 8.6 (Optional) One animation library
- `react-spring` and `framer-motion` are both used.
- **Recommendation: `framer-motion`.** Its API is simpler for the next maintainer. Do this only if it is cheap; it is low priority.

---

## Phase 9: Bug fixes

Work through [Appendix B](#appendix-b--known-bugs-backlog):
- **One bug per commit** (`fix: …`), each with a regression test where possible.
- Most will be much easier to fix after phases 3 to 7, which is why they wait until now.
- Ask the product owner to prioritise. Suggested top five: **B2** (round duration ignored), **B3** (batch import duplicates), **B4** (reorder mode), **B1** (skip timer), **B5** (new-topic detection).

---

## Phase 10: Tooling upgrade (optional, but recommended before handover)

### [ ] 10.1 CRA → Vite + Vitest
- CRA is deprecated and pulls in old Jest, Babel and webpack.
- **Migrate:**
  - `index.html` moves to the root.
  - `REACT_APP_BACKEND_URL` becomes `VITE_BACKEND_URL`. Update the Dockerfile `ARG`, both compose files and the GitHub workflow `build-args`.
  - Tests already run on Vitest (step 0.2); reuse `vitest.config.ts` as the `test` block of `vite.config.ts`.
  - `.eslintrc` moves to flat config.
- **Pull this forward to step 0.2** if the CRA Jest conflict can't be fixed quickly.
- **Verify:** all gates; Docker image builds; `compose-prod.yaml` smoke on a staging URL.

### [ ] 10.2 TypeScript 5, dependency refresh
- Bump TypeScript, `@types/react`, `react-router-dom` (minor), MUI (align the v5 packages) and socket.io-client.
- Use a lockfile refresh with `pnpm up`, one group per commit.

---

## Phase 11: Documentation and handover

*Documentation is written **as each phase lands**: each phase's last step includes updating the docs below. This phase finishes and reviews them.*

- [ ] **`client/README.md`**, rewritten. It covers:
  - Prerequisites (Node 20, pnpm via corepack, Docker)
  - Running with compose versus running the frontend against a local backend
  - Environment variables
  - Every script (`dev`, `build`, `test`, `e2e`, `lint`, `typecheck`, `format`)
  - Project layout in brief, with a link to the architecture doc
- [ ] **`client/docs/ARCHITECTURE.md`:** the folder map, providers and what each owns, the data flow (socket → provider → hook → component), and the rule that only `api/` talks to the socket.
- [ ] **`client/docs/GAME_FLOW.md`:** a state diagram (Mermaid) of the screens and the socket events that move between them, for both player and lecturer, including reconnect.
- [ ] **`client/docs/SOCKET_EVENTS.md`:** a table of every event, its direction, its payload and who handles it, generated from or kept in sync with `api/events.ts`.
- [ ] **`client/docs/THEMES.md`:** how to add a map or decoration, and how to add a new theme by implementing `ThemeConfig`.
- [ ] **`client/docs/GRASPLE.md`:** how exercises are embedded, the `postMessage` protocol, how attempts and scoring work, and how the lecturer platform adds exercises and variants.
- [ ] **`client/docs/LECTURER_PLATFORM.md`:** topics, exercises, variants, fake teams, subjects and studies, and how saving works.
- [ ] **Root `CONTRIBUTING.md`:** the gates, branch and commit conventions, and the `refactor` vs `fix` rule.
- [ ] **`CLAUDE.md`** (repo root): short pointers to the docs above and the gates, so AI assistants follow the same rules.
- [ ] **JSDoc** on every provider, hook, `api/` function and non-obvious pure function.
- [ ] **Root `README.md`:** fix the "Instalation" typo, use pnpm instead of npm, and link to the docs.

---

## Manual smoke checklist

Run the parts that are relevant to your change. Run the whole list at the end of each phase.

**Setup:** `docker compose up`, then open `http://localhost:8000`. The DB must be seeded with at least one topic, one exercise and one study. Use two browser profiles, one as lecturer and one as player.

1. **Home.** The page renders. The info menu works. The lecturer platform login fails with a wrong password and works with the right one.
2. **Lecturer platform:**
   - Topics tab: search, paginate, expand a topic.
   - Edit the name, subject and studies, then save and reload, and check they persisted.
   - Add an exercise by URL, and link an existing one.
   - Batch import; reorder the mandatory exercises; manage variants.
   - Add and delete fake teams.
   - Exercises tab: edit an exercise.
   - Instructions tab: the navigation scrolls to each section.
3. **Create game.** The password gate works, a lobby code is shown, and every step completes: topics (select, reorder, set duration), study, theme, name, individual placements. The start button enables correctly.
4. **Join.** An invalid code shows an error. A valid code goes to Waiting, and the tips rotate.
5. **Start.** Both screens reach TeamPreview, which shows the correct theme animation and team list. The countdown leads to Game (player) and Lecturer (lecturer).
6. **Game:**
   - The Grasple iframe loads.
   - A correct answer shows a toast and increases the score on both screens.
   - A wrong answer shows the tries-left toast. After the last try, the "Next question" box appears.
   - After the mandatory questions, the difficulty modal appears. The streak flame and multiplier show, and a cleared difficulty shows its crown.
   - The minimap moves and ghosts move.
   - The colour-coding info carousel opens.
7. **Lecturer view.** The track, ghosts, decorations and special decorations animate. The checkpoint banner shows. The timer counts down.
8. **Round end.** The leaderboard shows, including the player's placement if enabled. Then Statistics, then the next round (if configured), then the end screen with the QR code and feedback link.
9. **Reconnect.** Reload the player tab mid-round: they rejoin with the right score and time. Open a second tab: the "Already in lobby" warning appears.
10. **Boat theme.** Repeat steps 5 to 8 with the boat theme.

---

## Appendix A: Baseline measurements (fill in as you go)

| When | Bundle (gz) | LOC `src/` (ts/tsx) | `useState` in App.tsx | Lint warnings | Test suites passing |
|---|---|---|---|---|---|
| Baseline `0e7d99d` | 674 kB | 18,786 | ~40 | n/a (lint broken) | 0 / 29 (runner broken) |
| After 0.1 | 674 kB (identical hash) | 18,786 | ~40 | 648 (0 errors) | 0 / 29 (runner broken) |
| After 0.2 | 674 kB (identical hash) | 18,786 | ~40 | 648 (0 errors) | 14 / 29 files, 45 / 85 tests |
| After 0.3 | 674 kB (identical hash) | app code unchanged | ~40 | 604 (0 errors) | 10 / 10 files, 43 / 43 tests |
| After 0.4 | 674 kB (−3 B) | ~same (+`utils/grasple.ts`) | ~40 | 604 (0 errors) | 17 / 17 files, 155 / 155 tests |
| After phase 0 | | | | | |
| After phase 1 | | | | | |
| After phase 3 | | | | | |
| After phase 8 | | | | | |

---

## Appendix B: Known bugs backlog

Found during the survey. **Do not fix these during `refactor` steps.** Items marked (✓) were confirmed by reading the code during planning. Others came from automated survey passes and should be reproduced before fixing.

| # | Bug | Where (at `0e7d99d`) |
|---|---|---|
| B1 | **The skip button probably never appears.** The skip timer effect depends on the Grasple context object, which App recreates every second, so the 20 s timeout keeps restarting. It may be fixed as a side effect of 3.5. | `Questions/Question.tsx` (~89-109) |
| B2 | **Changing a round duration never reaches the parent,** so `startGame` uses the default. It is mutated in place, and non-zero seconds are coerced to 30. | `Lobby/Rounds/Rounds.tsx` `handleAcceptRoundDuration` (~210-217) |
| B3 | **Batch import both links an existing exercise and pushes it as a new one,** because a `return` is missing. It may also wipe unsaved edits through a props → state effect. | `TopicElement.tsx` (~188-221) |
| B4 | **Reorder mode is broken.** It renders one `DragDropContext` per exercise, splices the full list using filtered indices, and gives new exercises an empty `draggableId`. | `TopicElement.tsx` (~445-453, ~983-1037) |
| B5 | **New topics are never recognised as new.** The id is created as `new-topic-${Date.now()}` but checked with `_id === ""`. The server checks for `"new-topic"`. | `LecturerPlatform.tsx` (~96) vs `TopicElement.tsx` (~537, 685, 818) |
| B6 | **The "new exercise" marker is inconsistent:** `exerciseId` is `0` in one place and `-1` in another. | `TopicElement.tsx` (~351), `LecturerPlatform.tsx` (~106), `ExerciseElement.tsx` (~94, 108) |
| B7 | **Seconds are passed where milliseconds are expected:** `startOpenDelay` gets 2 or 3 but is used as ms. | `Questions/QuestionOverlayBox.tsx` (~51) |
| B8 | (✓) **Listeners leak once per render.** `beforeunload`/`unload` are added on every render, `window.onmessage` is reassigned, and `getMandatoryNum` is emitted. `onmessage` has no origin check. Fixed in 4.1. | `Game/Game.tsx` (~85-117) |
| B9 | (✓) **Duplicate `updated-*` listeners accumulate** on every data change. Fixed in 3.1. | `App.tsx` (~297-300, 507-508) |
| B10 | **Timers without cleanup:** Game (500 ms, 30 s), InfoModal, TeamStats, QuestionOverlayBox, DifficultyCard, Cow (a `setTimeout` *during render*), Ghosts, LapCompletedText, TeamPreview, PreviewBoatBackground, TrainBackground. | various |
| B11 | (✓) **Stale closures in socket handlers** registered once at mount: `isPlayer` in `onJoinedGameInProgress` and `onRaceStarted` → `gameStartHandler`. | `App.tsx` (~431-451, 341-344) |
| B12 | **"Password is incorrect" shows before the server has replied.** | `Home/Home.tsx` (~108) |
| B13 | **`formatTime` shows "00" seconds** once minutes are 10 or more. | `Lecturer/LecturerService.ts` (~110-112) |
| B14 | **Lecturer screen assumes a 10-minute round.** | `Lecturer/Lecturer.tsx` (~186) |
| B15 | **Leaderboard crashes** when `timeScores` is empty (it indexes `[length-1]` unguarded). | `Leaderboard/Leaderboard.tsx` (~49) |
| B16 | **Pagination count ignores the search filter.** | `LecturerPlatform.tsx` (~261, 314) |
| B17 | **A stray `0` is rendered** when there are no variants (`{n && …}`). | `ExerciseElement.tsx` (~161) |
| B18 | **List keys are indexes** on stateful rows, and tooltip ids are duplicated globally. | `LecturerPlatform.tsx`, `TopicElement.tsx`, `StudyEdit.tsx` |
| B19 | **Start button styling checks 3 steps,** while `disabled` checks 4 steps plus the player count. | `Lobby/StartGame/StartGame.tsx` (~50-58 vs 162-168) |
| B20 | **"Select all" never deselects.** | `StudyEdit.tsx` (~30-35) |
| B21 | **Invalid CSS value** `height: '5remis'`. | `TopicElement.tsx` (~678) |
| B22 | **Invalid colour** `"#3d6faf8b600a2ff"`, returned for any theme name except exactly `"Train"`/`"Boat"` (the check is case-sensitive). The height breakpoint gap at exactly 800 px is harmless: the defaults equal the 700–800 branch, as pinned in `GameService.test.ts`. | `Game/GameService.ts` (~25-30, 71) |
| B23 | **Checkpoint sprite lookup never matches:** it compares with lowercase theme names without normalising. | `Tracks/Tracks.tsx` `getCheckpointSprite` |
| B24 | **The boat map `rawPath` early return** gives `pathLength: 0` and `components: []`, so path-position helpers don't work on boat. | `RaceService.ts` `getRacePathObject` (~59-65) |
| B25 | **Round-over accuracy shows NaN** at 0/0. | `Questions/RoundOverModal.tsx` (~57-61) |
| B26 | **Game crashes if the server sends a `null` exercise** (`.difficulty` on null). | `Game/Game.tsx` (~559) |
| B27 | **Save errors are silent.** The server emits `error` from `updateTopic` and no client code listens for it. | `App.tsx` / server `socketConnection.ts` |
| B28 | **`fetch` calls have no error handling:** no try/catch and no `res.ok` check. | `Login.tsx`, `JoinGame.tsx` |
| B29 | **The difficulty modal shows hardcoded "Tries: 1/2/3"** that ignore the exercise's `numOfAttempts`. The base points duplicate the server's scores. | `DifficultySelection.tsx` (~97-119) |
| B30 | **`/LecturerPlatform` has no route guard.** The guard is commented out, and `loggedIn` is reset right after login anyway. A real fix needs server-side auth (Appendix D). | `LecturerPlatform.tsx` (~77-81), `App.tsx` (~546-556) |
| B31 | (✓) **Two navigation triggers at round end:** the timer's `onExpire` and the `round-ended` listener. | `App.tsx` (~109-116), `Game.tsx` (~261-266) |
| B32 | **Map decoration positions are random on each page load** (`Math.random` at import). This may be intended; confirm. | `BoatMaps.ts` (~140-143, 177-180) |
| B33 | (✓) **Wrong ordinal suffixes from 21 on:** "21th", "22th", "23th". This only shows with more than 20 teams. | `RaceService.ts` `formatRacePositionText` |
| B34 | (✓) **No lap colour after 5 laps:** `getColorForRaceLap(5)` returns `undefined`. | `RaceService.ts` `getColorForRaceLap` |
| B35 | (✓) **`formatTeamScores` sorts the caller's array in place.** | `Lecturer/LecturerService.ts` `formatTeamScores` |
| B36 | (✓) **A duplicate exercise URL ends with "Invalid URL" instead of "Exercise already exists".** Clearing the field re-runs validation and overwrites the message. | `ExerciseURLInput.tsx` validation effect |

---

## Appendix C: Socket event contract (as found)

This table is the source for `api/events.ts` (step 2.3). ⚠️ marks a mismatch.

**Client → server (emits):**
`addCheckpoint`, `addDefaultTeams`, `authenticate`, `beginRace`, `checkAnswer` ⚠️ (server handler commented out), `checkForDisabledDifficulties`, `createLobby`, `deleteDefaultTeams`, `deleteExerciseVariant`, `endRound`, `getAllDefaultTeams`, `getAllExercises`, `getAllStudies`, `getAllSubjects`, `getAllTopics`, `getAverageFinalScore` ⚠️ (no server handler), `getGhostTeams`, `getInformation`, `getLecturerStatistics`, `getLobbyData`, `getMandatoryNum`, `getMyPlacement`, `getNewQuestion`, `getRaceTrackEndScore`, `getResults` ⚠️ (server handler commented out), `joinLobby`, `leaveLobby`, `lecturerPlatformLogin`, `questionAnswered`, `saveTimeScore`, `startGame`, `startNextRound`, `themeSelected`, `updateExercise`, `updateTopic`, `wrongAttemptMade`

- The server also listens for `getGhostTrains` and `getTheme`, which the client never emits.
- `chooseDiffuculty` (sic) appears only in a stale test.

**Server → client (listened):**
`access-granted`, `all-default-teams`, `all-exercises`, `all-studies`, `all-subjects`, `all-topics`, `already-in-room`, `answered-all-questions` (empty handler), `authenticated`, `blocked-user-reconnection`, `chooseDifficulty`, `currentStreaks`, `disable-difficulty`, `end-game`, `game-ended`, `get-all-scores`, `get-checkpoints`, `get-next-grasple-question`, `get-next-question` ⚠️ (server emit commented out), `ghost-teams`, `joined-game-in-progress`, `lobby-data`, `mandatoryNum`, `new-player-joined`, `race-started`, `race-track-end-score`, `ready-for-question-request`, `result` ⚠️ (server emit commented out), `rightAnswer`, `round-duration`, `round-ended`, `round-information`, `round-started`, `score`, `statistics`, `themeChange`, `updated-exercise`, `updated-topic`, `wrongAnswer` ⚠️ (server emit commented out), `your-placement`

- The server emits `error` ⚠️ and `ghost-trains` ⚠️, and the client has no listener for either.

**Where listeners live today:**
- About 30 in `App.tsx`, none removed.
- `Game.tsx` uses `off(evt).on(evt)`, which removes *all* handlers for that event.
- Also `Lobby.tsx`, `Lecturer.tsx`, `Login.tsx` and `QuestionStatistics.tsx`. `QuestionStatistics` is the only one that cleans up correctly.

---

## Appendix D: Out of scope (server and security), for the backend owner

These were found while surveying the frontend. The frontend refactor cannot fix them, but the next maintainer should know about them.

1. **No server-side authorisation.**
   - The server never records that a socket has authenticated.
   - Any client can emit `updateTopic`, `updateExercise`, `addDefaultTeams`, `deleteDefaultTeams`, `deleteExerciseVariant`, `getAll*`, `createLobby` or `startGame`.
   - `GET /api/lobby/create` is also open.
2. **The server trusts the client's scoring.** It awards points when it receives `questionAnswered(true, difficulty)`, so any client can claim a correct answer.
3. **Password handling.** The client's old `Login.test.tsx` also contained the plaintext, which is now removed from the working tree but remains in git history.
   - There is one shared password, stored as an unsalted SHA-256 hash hardcoded in `socketConnection.ts`.
   - The plaintext appears to be committed in `server/src/__tests__/socketConnection.test.ts`. **Rotate it.**
4. **Server README and scripts** also need a documentation pass (`build-broken-for-some-reason` in `package.json`).
5. **Share `events.ts`** between client and server (see 2.3).

---

## Status log

| Date | Step | Commit | Notes |
|---|---|---|---|
| 2026-09-29 | Plan written | – | Baseline measured at `0e7d99d` |
| 2026-09-29 | Decisions | – | 1.4: delete the legacy question types. 0.2: use Vitest for tests. |
| 2026-09-29 | 0.1 | `fc1d1d7` | `.nvmrc` 20; `typecheck` + working `lint`; lint baseline 648 warnings, 0 errors |
| 2026-09-29 | 0.2 | `6220fbf`, `afa4c12` | Vitest replaces Jest; 45/85 tests pass (stale tests, triaged in 0.3) |
| 2026-09-29 | 0.3 | `fcebe99`, `4f131ac` | 19 stale test files deleted; 10 files / 43 tests green; global socket and fetch mocks; tests included in typecheck |
| 2026-09-29 | 0.4 | `f41652a` | 112 characterisation tests (155 total); Grasple parsing extracted to `utils/grasple.ts`; bugs B33–B36 added |
| 2026-09-29 | 0.5 | *(uncommitted)* | Prettier over 175 files; Markdown excluded; bundle text-equivalent; `fix-bugs` will need a 2-file conflict resolution |
