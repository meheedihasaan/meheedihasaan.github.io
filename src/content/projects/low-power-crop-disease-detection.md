---
title: Low-power crop disease detection for smallholder rice farms
summary: A rice-leaf disease classifier small enough to run offline on a low-cost phone, with its energy use measured and reported, so farmers get a diagnosis in the field without a data connection or a data centre.
status: ongoing
statusLabel: Ongoing · IAR, MIU
areas: [AI in Agriculture, Green AI]
order: 1
progress: 25
example: true
meta:
  - { label: Period, value: Nov 2026 – Dec 2027 }
  - { label: Role, value: "Research Engineer, lead developer" }
  - { label: Region, value: "Bengal delta, Bangladesh" }
  - { label: Status, value: Data collection }
links:
  - { label: Paper · in preparation }
  - { label: Code, url: "#" }
  - { label: Dataset, url: "#" }
image:
  src: /img/bengal-delta-vegetation.webp
  small: /img/bengal-delta-vegetation-640.webp
  alt: Satellite view of South and Southeast Asia coloured by a vegetation index, with dense green over the Bengal delta and Bangladesh and tan over drier land to the west.
  caption: Vegetation index over the Bengal delta, derived from NASA Blue Marble imagery. For illustration, not analysis.
glance:
  - { value: "≥ 90%", label: target accuracy on field photos }
  - { value: "8×", label: less energy per diagnosis than the baseline }
  - { value: "4.8 MB", label: model size on the phone }
  - { value: "0", label: network calls per diagnosis }
chart:
  title: Energy per 1,000 diagnoses
  unit: watt-hours, lower is better
  note: Example values. The highlighted bar is this project's model.
  rows:
    - { name: "Baseline (FP32, cloud-size)", value: 41.0, accuracy: "93.1%", size: 98 MB, latency: 410 ms }
    - { name: FP16, value: 23.5, accuracy: "93.0%", size: 49 MB, latency: 240 ms }
    - { name: INT8, value: 9.8, accuracy: "92.2%", size: 25 MB, latency: 120 ms }
    - { name: "INT8 + pruned + distilled (ours)", value: 5.1, highlight: true, accuracy: "91.4%", size: 4.8 MB, latency: 64 ms }
footprint:
  - { value: 9 h, label: "GPU time, one consumer GPU" }
  - { value: 2.4 kWh, label: "electricity, measured" }
  - { value: 1.4 kg, label: CO₂e at Bangladesh grid intensity }
  - { value: "1", label: training run reported (no hidden sweeps) }
outputs:
  - { title: "Paper: on-device rice disease detection", note: in preparation · target venue TBD, label: PDF }
  - { title: "Code: training and on-device inference", note: "open source, MIT licence (planned)", label: GitHub, url: "#" }
  - { title: "Dataset: field photos with labels", note: to be released after review, label: Dataset }
people:
  - { name: Mehedi Hasan, role: "Research Engineer, IAR · lead developer" }
  - { name: Supervisor name, role: "IAR, MIU · principal investigator" }
  - { name: Partner organisation, role: field data and agronomy }
timeline:
  - { date: Nov 2026, text: "Project start, literature review", state: done }
  - { date: Jan 2027, text: Field data collection with partner farms, state: now }
  - { date: Apr 2027, text: Compression experiments and energy measurement }
  - { date: Aug 2027, text: Field trial with farmers }
  - { date: Dec 2027, text: "Paper, code and dataset release" }
cite: |
  @misc{hasan2026ricedisease,
    title  = {Low-power crop disease detection for smallholder rice farms},
    author = {Hasan, Mehedi},
    year   = {2026},
    note   = {Research project, IAR, Manarat International University}
  }
---

## Problem

Rice diseases such as blast and bacterial leaf blight can destroy a large part of a harvest when they are caught late. Farmers rarely have an expert nearby, and cloud-based diagnosis apps need a reliable connection, send every photo to a server and cost energy on both ends.

The question: can a model accurate enough to be useful run entirely on a cheap phone, and how much energy does that save compared with a large model in the cloud?

## Approach

<figure class="pipe-fig">
<svg class="pipe" viewBox="0 0 860 150" role="img" aria-labelledby="pipeT">
  <title id="pipeT">Pipeline: a field photo goes to an on-device model, which returns a diagnosis and advice in Bangla, without a network.</title>
  <defs><marker id="ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path class="tip" d="M0 0L10 5L0 10z"/></marker></defs>
  <g><rect class="box" x="2" y="30" width="180" height="84" rx="12"/><text x="22" y="66">Field photo</text><text class="sub" x="22" y="88">phone camera</text></g>
  <path class="arrow" d="M186 72H222" marker-end="url(#ar)"/>
  <g><rect class="box hl" x="226" y="30" width="200" height="84" rx="12"/><text x="246" y="66">On-device model</text><text class="sub" x="246" y="88">INT8 · pruned · 4.8 MB</text></g>
  <path class="arrow" d="M430 72H466" marker-end="url(#ar)"/>
  <g><rect class="box" x="470" y="30" width="180" height="84" rx="12"/><text x="490" y="66">Diagnosis</text><text class="sub" x="490" y="88">disease + confidence</text></g>
  <path class="arrow" d="M654 72H690" marker-end="url(#ar)"/>
  <g><rect class="box" x="694" y="30" width="162" height="84" rx="12"/><text x="714" y="66">Advice</text><text class="sub" x="714" y="88">in Bangla, offline</text></g>
  <text class="sub" x="226" y="140">energy measured per diagnosis on the phone</text>
</svg>
</figure>

- Start from a compact image model, then shrink it with quantization (INT8), pruning and knowledge distillation from a larger teacher.
- Measure energy per diagnosis on real low-cost phones, and training energy with a power meter or CodeCarbon.
- Keep a person in the loop: low-confidence results send the farmer to an agricultural extension officer.

## Data

Photos of rice leaves taken in the field, labelled by agronomists.

| Source | Images | Classes | Licence |
|---|--:|---|---|
| Field collection, partner farms | 12,000 | 6 diseases + healthy | CC BY 4.0 (planned) |
| Public rice-leaf dataset | 5,900 | 4 diseases + healthy | per source |
