# Frontend boundary

The production UI will be built after contract semantics and Direct Mode verification are stable.

Non-negotiable UX requirements:

- show old/new policy versions side-by-side;
- show materiality verdict and re-consent state;
- never label `ACCEPTED` as `FINALIZED`;
- never show an awaiting/rejected/expired/superseded version as authorized;
- support fresh review after a superseding proposal;
- expose version lineage and immutable history clearly.
