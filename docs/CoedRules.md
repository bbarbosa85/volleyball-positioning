# Volleyball COED 6v6 Tactical Rules & Constraints

> **Top-Level Domain Reference**  
> *Requirements Index: [docs/Requirements.md](./Requirements.md)*  
> *Last updated: October 2026*

---

## 1. Overview & League Standard

Competitive **COED 6v6 volleyball** involves strict gender balance and tactical rotation constraints designed for fair play, player safety, and tactical clarity.

### Fundamental Team Structure
- **Equal Gender Representation**: Exactly 6 players on the court at all times: **3 Men (`M`) and 3 Women (`F`)**.
- **Alternating Rotation Sequence**: Players must alternate by gender in the serving order throughout the match:
  ```
  Zone 1: Male (M)
  Zone 2: Female (F)
  Zone 3: Male (M)
  Zone 4: Female (F)
  Zone 5: Male (M)
  Zone 6: Female (F)
  ```
  *(or vice-versa, depending on initial lineup order)*.
- **Simplified Visual Modeling**: Players are represented on court strictly by their **court zone number (1–6)** and **gender identity color** (Blue for Men, Rose/Pink for Women). Personal names and complex roster lineups are omitted to maximize visual clarity and minimize shared link payload size.

---

## 2. Rotation Configurations & Front-Row Composition

Because of the alternating gender sequence, the team naturally alternates between two front-row structural compositions as the team rotates:

```
                  NET (y = 0%)
        [Zone 4]    [Zone 3]    [Zone 2]
        ───────────────────────────────── (3m Attack Line)
        [Zone 5]    [Zone 6]    [Zone 1]
```

### 2.1 Rotation 1: Men Serving (1 Man on Net • 2 Women Front)
- **Front Row (Zones 4, 3, 2)**:
  - **Zone 4**: Female (`F`) — Left-front
  - **Zone 3**: **Male (`M`)** — Middle-front (Solo Blocker on Net)
  - **Zone 2**: Female (`F`) — Right-front
- **Back Row (Zones 5, 6, 1)**:
  - **Zone 5**: Male (`M`) — Left-back
  - **Zone 6**: Female (`F`) — Middle-back
  - **Zone 1**: Male (`M`) — Right-back (Server)
- **Tactical Reality**: With only 1 man in the front row, the team has only **1 eligible blocker**.

### 2.2 Rotation 2: Women Serving (2 Men on Net • 1 Woman Front)
- **Front Row (Zones 4, 3, 2)**:
  - **Zone 4**: **Male (`M`)** — Left-front
  - **Zone 3**: Female (`F`) — Middle-front
  - **Zone 2**: **Male (`M`)** — Right-front
- **Back Row (Zones 5, 6, 1)**:
  - **Zone 5**: Female (`F`) — Left-back
  - **Zone 6**: Male (`M`) — Middle-back
  - **Zone 1**: Female (`F`) — Right-back (Server)
- **Tactical Reality**: The team has **2 eligible blockers** in the front row.

## 3. The Multi-Touch Gender Contact Rule

In official competitive COED volleyball regulations:
- **Mandatory Female Contact**: If the ball is contacted more than once on a side (2 or 3 touches) before crossing the net, **at least one female player must contact the ball** (whether on the 1st, 2nd, or 3rd touch).
- **Single-Touch Exemption**: If the ball is played back over the net on the very first contact (1 touch only), any player (male or female) may hit it over without restriction.
- **Block Exemption**: A block at the net **does not count as a team touch** for this scenario:
  - If a male blocker touches/deflects the ball at the net, that block does not count toward the 3 allowed team hits, nor does it count against the gender touch requirement.
  - If the team subsequently uses more than one touch (e.g. dig + attack, or dig + set + attack), at least one woman must touch the ball before it crosses back over the net.
- **Tactical Defensive Implications**:
  - Directly dictates transition coverage: If a male defender digs a hard-driven ball (Touch 1), the team must ensure a woman participates in the counter-attack—either by having a female setter take Touch 2, or ensuring a female hitter takes Touch 3 if a male player sets.

---

## 4. Front-Row Blocking Rules & Constraints

In this simulator, official COED net-play rules and competitive defensive conventions are enforced:

### 3.1 Women on the Net Do Not Block
- In competitive COED play (played on standard 2.43m men's height net), female front-row players **do not contest the block** against opponent male attackers or hard swings.
- **Defensive Behavior**: Front-row women pull off the net (approximately 2.5 to 3.5 meters into the court, or peel along the sideline/donut area) to:
  - Dig soft tips and roll shots dropped right behind the block.
  - Cover the sharp cross-court cut.
  - Guard the sideline alley when the blocker seals inside.

### 3.2 Men-Only Blocking Policy
- **Only front-row male players are eligible to block at the net**.
- Back-row men cannot jump to block or participate in a completed block at the net.

### 3.3 Single Blocker vs. Double Blocker Policy
1. **When 1 Man is in the Front Row (Rotation 1)**:
   - Always **1 Solo Blocker**.
   - The front-row man shifts along the net to seal the opponent attacker's primary hitting angle (line or cross depending on tactical scheme).
2. **When 2 Men are in the Front Row (Rotation 2)**:
   - **Default (Single Man Block)**: The front-row man closest to the attack side (Zone 4 man for an opponent right-side attack, Zone 2 man for an opponent outside attack) jumps solo, while the second front-row man pulls off the net into the 3-meter zone to cover tips or dig off-speed shots.
   - **Double Block (Optional Mode)**: If double block mode is enabled, both front-row men close together at the point of attack to form a 2-man wall.

---

## 5. Back-Row Defense & Tip Coverage

Because of the blocking constraints, back-row defenders must compensate based on the active scheme:

### 5.1 6-Deep Defense (Perimeter)
- **Zone 6 (Middle-Back)**: Positions deep on the end line (8.5m – 9m from the net) to dig high-velocity balls deflecting off the block or spiked over the block.
- **Wing Defenders (Zones 5 & 1)**: Hug the sidelines and step up or back depending on whether the hitter is attacking line or cross.
- **Off-Blocker Coverage**: The non-blocking front-row player(s) dig the dead space between the 3m line and the block.

### 5.2 6-Up Defense (Donut / Tip Cover)
- **Zone 6 (Middle-Back)**: Advances into the center "donut" area (approx. 4m – 5m from net) to aggressively absorb tips, roll shots, and dumps.
- **Wing Defenders (Zones 5 & 1)**: Pinch deeper into the court corners to protect against deep baseline hits.

---

## 6. Direct Manipulation & Coordinate Preservation

- **Coordinate Preservation Invariant**: Whenever a coach or user drags any player to customize their position on the court, the simulator **preserves those exact coordinates**.
- Automated COED heuristics must **never overwrite or snap-back** user-dragged coordinates.
