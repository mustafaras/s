# Şeyma — Psychological Evaluation and Psychological Profile

> **Document type:** Documentation-only record  
> **Repository:** [mustafaras/s](https://github.com/mustafaras/s)  
> **Assessment version:** `SEYMA_PROFILE_ASSESSMENT_V1` / `1.0.0`  
> **Assessment language:** Turkish (`tr-TR`)  
> **Review date:** 18 August 2026

This document records the psychological-design evaluation of Şeyma and describes the psychological profile produced by its built-in profile-assessment engine. It does **not** contain personal answers, raw diary entries, or an individual user's scores.

## 1. Psychological Evaluation

### Overall result

**Qualitative product-level assessment: 9.5/10**

This rating describes the quality of Şeyma's psychologically informed self-reflection architecture. It is **not** a clinical score, a psychometric validity coefficient, or a score assigned to a person.

The system is strong because it combines broad construct coverage, transparent scoring, response-quality checks, consent boundaries, dimensional interpretation, and non-diagnostic reporting. The principal remaining limitation is that the item bank is original and theory-informed but is not presented as a fully normed or psychometrically validated clinical instrument.

### Evaluation summary

| Evaluation area | Result | Evidence-based assessment |
|---|---|---|
| Psychological construct coverage | Strong | Nine modules and 174 items cover personality, emotion, motivation, values, cognition, work style, relationships, attachment, self-compassion and current wellbeing context. |
| Measurement architecture | Strong | Three explicit seven-point response scales are used: fit, interest and value importance. Reverse-scored items are handled with a documented formula. |
| Scoring transparency | Strong | Facet and construct scores are computed deterministically; minimum completion rules are explicit and insufficient data are not silently converted into scores. |
| Response-quality control | Strong | Completion, attention checks, response timing, within-facet consistency, repeated-answer runs and answer revisions contribute to a weighted quality score. |
| Psychological safety | Strong | Consent is separated from completion; the system states that the result is not a diagnosis and avoids presenting personality tendencies as fixed defects. |
| Interpretive discipline | Strong | Reports use probabilistic language such as “suggests a tendency,” show the mean on a 1–7 scale, and avoid clinical labels, moral rankings and employability judgments. |
| Context sensitivity | Strong | Attachment anxiety and avoidance are reported as separate continuous dimensions; current wellbeing context is kept separate from stable trait-like constructs. |
| Reporting reproducibility | Strong | The report generator is deterministic and template-based; the same score and quality inputs produce the same report. It does not require an LLM. |
| Psychometric maturity | Developing | The source identifies the items as original and theory-informed. Normative samples, percentile tables, formal reliability estimates and independent validation are not included. |
| Clinical suitability | Intentionally limited | Şeyma is appropriate for structured self-reflection and personal development support, not diagnosis, crisis assessment, treatment planning or professional selection. |

### Main strengths

1. **Broad but structured coverage.** The assessment does not reduce psychological functioning to a single personality label. It combines relatively stable tendencies, interpersonal patterns, cognitive style, motivation, work behaviour and present-period context.

2. **Separation of stable and contextual information.** Recent load, recovery and interest are treated as current-context variables rather than being merged into permanent personality scores.

3. **Dimensional interpretation.** Attachment is not forced into a single “secure,” “anxious” or “avoidant” category. Anxiety and avoidance remain separate dimensions, which is less reductive.

4. **Non-moral treatment of values.** Values are scored both as raw means and as person-centred relative priorities. A higher value is not described as evidence of being a better person.

5. **Quality-aware reporting.** Incomplete or low-confidence responses are not presented with the same certainty as a complete, attentive response pattern.

6. **Constructive interpretation.** High scores can be described as strengths while also acknowledging possible overuse; low scores lead to practical growth suggestions rather than stigmatizing labels.

### Important limitations

- The assessment is self-report and reflects one assessment session.
- The item bank is original and theory-informed; the repository does not establish clinical norms or population-level validity.
- No percentile, T-score, diagnosis, disorder label or normal/abnormal classification is produced.
- A profile result should not be used as a substitute for a licensed psychologist's assessment.
- A high or low score is a tendency signal, not a fixed identity or prediction of behaviour in every context.
- A completed profile should be interpreted together with the person's lived context, not in isolation from it.

## 2. Psychological Profile

### Profile architecture

Şeyma's profile is a multidimensional self-report profile. It combines Big Five-adjacent traits with additional constructs that are useful for reflective and behavioural planning.

| Profile family | Constructs or dimensions |
|---|---|
| Self-management and emotional structure | Conscientiousness-related organisation, responsibility, productivity, persistence, planning, carefulness and self-monitoring; negative emotionality-related anxiety, volatility, stress sensitivity, recovery and worry control. |
| Social personality and communication | Extraversion, sociability, assertiveness, energy, social initiative, agreeableness, compassion, respectfulness, trust, listening, conflict expression, boundaries, feedback, repair and social awareness. |
| Openness and character integrity | Intellectual curiosity, creative imagination, aesthetic sensitivity, belief flexibility, novelty, learning orientation, fairness, sincerity, modesty, greed avoidance, intellectual humility, error admission, evidence orientation and certainty calibration. |
| Interests | RIASEC: Realistic, Investigative, Artistic, Social, Enterprising and Conventional interests. |
| Values and motivation | Self-direction, stimulation, achievement, power/influence, security, tradition/conformity, benevolence, universalism; autonomy, competence, relatedness, intrinsic, identified, external, introjected, amotivation, purpose and balance. |
| Cognitive and decision style | Need for cognition, analysis, intuition, ambiguity tolerance, closure need, evidence search, confirmation-bias awareness, complexity, rational, avoidant, dependent and spontaneous decision tendencies, and post-decision rumination. |
| Metacognition | Confidence calibration, belief revision, source evaluation, reflection, thought observation, error monitoring, uncertainty admission and self-assessment. |
| Work style | Task initiation, time management, focus, distraction management, procrastination, perfectionism, completion, prioritisation, flexibility, routine, deep work, feedback use, energy management, rest boundaries, delegation, uncertainty action and review. |
| Relationships and attachment | Attachment anxiety and avoidance, support seeking, closeness tolerance, boundaries, conflict expression, repair, trust, autonomy, needs expression, withdrawal, rejection sensitivity, mutuality and secure-base behaviour. |
| Emotion regulation and wellbeing | Emotional awareness, reappraisal, suppression, rumination, distress tolerance, self-kindness, self-judgment, common humanity and recent load/recovery/interest context. |

### Nine assessment modules

| Module | Items | Psychological focus |
|---|---:|---|
| S01 — Self-management and emotional structure | 20 | Responsibility, organisation, persistence and emotional sensitivity. |
| S02 — Social personality and communication | 20 | Sociability, assertiveness, empathy, trust and communication behaviour. |
| S03 — Openness and character integrity | 20 | Curiosity, creativity, open-mindedness, fairness and epistemic humility. |
| S04 — Interests — RIASEC | 24 | Interest intensity across six vocational/activity domains. |
| S05 — Values and motivation | 18 | Personal values and autonomous versus controlled motivation. |
| S06 — Cognitive style and decision making | 18 | Analytical and intuitive tendencies, uncertainty tolerance and decision strategies. |
| S07 — Work style and self-management | 18 | Starting, focusing, completing, prioritising and sustaining work. |
| S08 — Social relationships and attachment | 20 | Attachment anxiety/avoidance and relationship skills. |
| S09 — Emotion regulation, wellbeing and metacognition | 16 | Emotion regulation, self-compassion, thought awareness and recent context. |
| **Total** | **174** | **Single-session integrated assessment.** |

The source marks **31 items as sensitive**: 20 in the relationships/attachment module and 11 in the emotion-regulation, wellbeing and metacognition module. Response-quality items are excluded from psychological construct scores.

## 3. Scoring and Interpretation

### Response scales

All response values range from 1 to 7:

- **FIT_7:** how well a statement describes the respondent;
- **INTEREST_7:** how strongly an activity attracts the respondent;
- **VALUE_7:** how important a principle is to the respondent.

Reverse-scored items use:

`scored value = 8 - raw value`

### Score bands

| Mean score | Band | Interpretation |
|---:|---|---|
| 5.5–7.0 | High | A comparatively pronounced tendency in this direction. |
| 2.6–5.4 | Moderate | A balanced or mid-range tendency. |
| 1.0–2.5 | Low | A comparatively less pronounced tendency in this direction. |

These bands are descriptive. They are not diagnostic categories and do not represent population percentiles.

### Data sufficiency

- A facet requires at least **80% item completion** before a mean is interpreted.
- A construct requires at least **80% of its facets** to be sufficiently completed.
- Insufficient data remain explicitly unavailable; they are not silently treated as zero or as an average score.
- Construct facets are equally weighted in the current scoring implementation; no factor-loading model is claimed.

### Special interpretation rules

- **RIASEC:** each interest domain is scored separately. The report presents the top three domains, the difference between the first and second domains, and a simple differentiation measure between the highest and lowest domains.
- **Values:** raw means and person-centred scores are both retained. The output describes relative personal priorities, not moral superiority.
- **Attachment:** anxiety and avoidance are reported continuously and separately. A categorical attachment label is not required.
- **Wellbeing context:** recent load, recovery and interest describe the current period and do not alter stable trait-like scores.
- **Contradictory-looking patterns:** the report can explain that combinations such as high sociability with high relational avoidance, high achievement values with procrastination, or high compassion with strong boundaries are not automatically contradictions.

### Response-quality score

The response-quality engine combines five components:

| Component | Weight |
|---|---:|
| Completion | 30% |
| Attention checks | 20% |
| Response timing | 20% |
| Within-facet consistency | 20% |
| Answer variance and revisions | 10% |

Quality categories are:

- **High:** 85–100
- **Adequate:** 70–84
- **Limited:** 50–69
- **Low:** below 50

A single quality signal does not automatically invalidate a profile. Warnings are surfaced for incomplete completion, missed attention checks, very rapid answering, long same-answer runs or extensive revisions.

## 4. Reported Psychological Profile

The deterministic report generator produces the following sections:

1. Measurement confidence
2. Brief character summary
3. Big Five areas
4. Character integrity and epistemic approach
5. RIASEC top three interests
6. Value priorities
7. Motivation sources
8. Cognitive style and decision making
9. Work style
10. Attachment anxiety and avoidance
11. Emotion regulation, self-compassion and metacognition
12. Strengths
13. Possible overuse risks
14. Growth suggestions
15. Limitations

The language rules are intentionally cautious:

- “suggests a tendency” is preferred to certainty;
- means are shown on the 1–7 scale;
- emotional sensitivity is not framed as a defect;
- values are not ranked morally;
- the output does not make hiring or employability judgments;
- diagnosis, disorder and normal/abnormal classifications are not produced.

## 5. Individual Results Availability

No completed personal response set is included in the public `mustafaras/s` repository at the time of this record. Therefore, this document does **not** claim:

- an individual's construct means;
- a personal RIASEC code;
- personal attachment anxiety or avoidance levels;
- an individual response-quality score;
- a person-specific strengths, risks or growth profile.

Any personal psychological profile should be generated only from consented assessment data and should remain within an appropriately protected data boundary. No personal response, diary text or raw sensitive answer has been added to this repository document.

## 6. Evidence and Source Files

- [Profile assessment item bank and scoring map](../profileAssessmentV1.js)
- [Scoring and deterministic report generator](../app.js)
- [Headless scoring verification](../.claude/skills/run-seyma/verify-profile-assessment-scoring.mjs)
- [Headless report verification](../.claude/skills/run-seyma/verify-profile-assessment-report.mjs)
- [Response-quality verification](../.claude/skills/run-seyma/verify-profile-assessment-quality.mjs)
- [Consent verification](../.claude/skills/run-seyma/verify-profile-assessment-consent.mjs)
- [Repository data-safety rules](../AGENTS.md)

**Bottom line:** Şeyma provides a broad, careful and psychologically responsible self-reflection profile. Its strongest contribution is the combination of multidimensional coverage and restrained interpretation. Its next scientific maturity step would be formal psychometric validation, including reliability, construct validity, criterion validity and norm development.
