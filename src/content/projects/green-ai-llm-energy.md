---
title: "Green AI: reducing the energy consumption of large language models"
summary: Measuring where large language models spend their energy, and finding ways to cut it without losing the quality people rely on.
status: ongoing
statusLabel: Ongoing · IAR, MIU
areas: [Green AI]
order: 1
meta:
  - { label: Started, value: Nov 2026 }
  - { label: Role, value: Research Engineer }
  - { label: Institute, value: "IAR, MIU" }
  - { label: Stage, value: Ongoing }
---

## Abstract

Large language models (LLMs) have become part of everyday work, but every answer they give runs billions of calculations on power-hungry hardware. While the energy cost of training a model has received attention, the cost of serving it, repeated for every request over the model's whole life, is often larger and far less studied. This project investigates how to reduce the energy consumption of LLMs, with a focus on inference. It first builds a careful method for measuring energy per token and per request on real hardware, then evaluates techniques that lower that energy: model compression (quantization, pruning and knowledge distillation), more efficient inference (batching, caching and faster decoding), and routing each request to the smallest model that can handle it. Each technique is judged by the trade-off it makes between energy saved and quality lost. The aim is practical, evidence-based guidance for running language models at a fraction of their current energy cost, and a case for reporting energy alongside accuracy as a standard part of AI research.

**Keywords:** Green AI, large language models, energy efficiency, inference, model compression, sustainable computing

## Background and motivation

The growth of AI has made data centres one of the fastest-growing users of electricity. LLMs are a large part of that growth: they are big, they run on GPUs, and they are used millions of times a day. Training a model is a one-off cost; serving it is not. For a widely used model, the total energy spent answering requests can outweigh the energy spent training it many times over.

That energy has a carbon cost, and in many regions a water cost for cooling. It also has a cost in access: where electricity is expensive or unreliable, as in much of Bangladesh and the Global South, running capable AI locally is out of reach. Making LLMs more efficient makes them both greener and more widely usable.

Despite this, most AI research reports accuracy and speed, not energy. Without honest energy numbers, claims that a model is "efficient" are hard to check or compare.

## Research questions

1. **Where does the energy go?** How much energy does an LLM use per token and per request on real hardware, and how is it split between computation, memory movement and idle time?
2. **What saves the most?** Which techniques, alone and combined, reduce that energy the most for a given loss in quality?
3. **When is a smaller model enough?** For which kinds of requests can a small model replace a large one without users noticing a difference?
4. **How should it be reported?** What is a simple, repeatable way to measure and report the energy of an LLM, so that results can be compared across studies?

## Methodology

**Measurement.** Energy is measured on the hardware the models actually run on, using GPU and CPU power readings during controlled runs, with idle power subtracted. Results are reported per token and per request, together with latency and output quality, so that every saving can be weighed against what it costs.

**Techniques studied.**
- *Model compression:* lowering numerical precision (quantization), removing parts of the model that contribute little (pruning), and training smaller models to imitate larger ones (knowledge distillation).
- *Efficient inference:* processing requests together (batching), reusing earlier computation (caching), and generating text in fewer expensive steps (faster decoding methods).
- *Right-sizing:* routing simple requests to a small model, so that a large model runs only when it is needed.

**Evaluation.** Open-weight models of different sizes are tested on standard language tasks. For each technique, the study records energy used, quality of the output and response time, and compares them with the unmodified model. Experiments are repeated to make sure differences are real and not noise.

## Expected contributions

- A clear, repeatable method for measuring the energy of LLM inference.
- A comparison of energy-saving techniques, showing how much each saves and how much quality it costs.
- Practical guidance on choosing and configuring language models for low energy use, including on modest hardware.
- An argument, with evidence, for reporting energy alongside accuracy in AI research.

## Current status

The project is in its early stage: reviewing existing work on AI energy use and setting up the measurement method. Results, papers and code will be shared on this page as they become available.
