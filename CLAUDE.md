# CLAUDE.md — Build Prompt

## Role

You are an expert mobile app engineer and product architect. Your task is to design and build a production-ready mobile application called **Compsoc Feedback**, focusing on scalability, clean architecture, and excellent UX.

## SIGs in Compsoc include: 
CCSIG (Competitive programming), GameDevSIG (Game development), Edinburgh AI, Edinburgh Neurotech, Tardis (hosting servers), Project share, SiGINT (Cyber Security), Edinburgh Venture Point, QuantSIG, CloudSIG (AWS Cloud), BitSIG (Computer architecture, networks, OS), TypeSIG (Type theory)

---

## Objective

Build a **mobile app (NOT a website)** that enables seamless, incentivised feedback collection at CompSoc events using:

* Bluetooth Low Energy (BLE)
* Gamification (points, rankings, badges)
* AI-assisted feedback filtering
* Role-based dashboards (Member vs Organiser)

---

## Platform Requirements

* Must work on **iOS and Android**
* Use a cross-platform framework (preferred: **Flutter** or **React Native**)
* Handle platform-specific permissions:

  * iOS: Bluetooth + Location permissions
  * Android: Bluetooth + Nearby Devices permissions

---

## Core Features to Implement

### 1. BLE Feedback Broadcasting

* Implement BLE scanning to detect nearby beacons
* When a beacon is detected:

  * Trigger a notification or in-app prompt
  * Open the relevant feedback form
* Beacon is placed at event entrance and maps to a specific event/session

---

### 2. Authentication & Roles

Implement two user roles:

* **Member**
* **Organiser**

Auth system should support:

* Email or university login (mock acceptable for MVP)

---

### 3. Feedback System

* Short-form feedback (multiple choice + optional text)
* Each submission is tied to:

  * Event
  * SIG (Special Interest Group) SIGS include
  * User

---

### 4. Event Code Verification

* Each event has a unique code
* Users must input the code to:

  * Verify attendance
  * Receive points
* Prevent duplicate submissions or abuse

---

### 5. Gamification System

#### Points

* Award points for:

  * Submitting feedback
  * Entering valid event code

#### Rankings

* Global leaderboard
* SIG-specific leaderboard

#### Badges

* Bronze / Silver / Gold tiers
* Based on participation thresholds

Display on user profile:

* Total points
* Rankings
* Badge level

---

### 6. Organiser Dashboard

#### Required Views

* **SIG Dashboard**

  * Aggregate stats across all events
* **Event Dashboard**

  * Feedback per event
* **Workshop Dashboard**

  * Recurring session insights

#### Metrics

* Number of submissions
* Average ratings
* Engagement levels

---

### 7. AI Feedback Filtering

Implement a lightweight AI/NLP system that:

* Detects low-quality responses (e.g. spam, empty phrases)
* Classifies feedback into:

  * Useful
  * Low-quality

Requirements:

* DO NOT delete any data
* Store filtered responses separately
* Allow organisers to toggle visibility of filtered responses

Start simple:

* Rule-based + keyword filtering
* Extendable to ML model later

---

## Data Model (High-Level)

Design a backend schema including:

* Users (role, points, badges)
* SIGs
* Events
* Feedback submissions
* Rankings
* Filtered vs unfiltered feedback flags

---

## Tech Stack Expectations

### Frontend

* Flutter or React Native
* Clean UI with intuitive flows
* Real-time updates where needed

### Backend

* Node.js / Firebase / Supabase (choose one and justify)
* REST or GraphQL API

### Database

* Structured relational or NoSQL (justify choice)

---

## UX Requirements

* Minimal friction for submitting feedback (≤ 30 seconds)
* Clear incentive visibility (points, badges)
* Simple onboarding for first-time users
* Clean separation between Member and Organiser experiences

---

## Security & Integrity

* Prevent fake submissions:

  * Require event code validation
  * Rate limiting
* Secure authentication
* Basic abuse prevention

---

## Deliverables

You must produce:

1. **Architecture Design**

   * System diagram
   * Tech stack justification

2. **Database Schema**

   * Tables/collections and relationships

3. **Mobile App Structure**

   * Screens
   * Navigation flow

4. **Key Feature Implementations**

   * BLE detection logic
   * Feedback submission flow
   * Points + ranking logic
   * AI filtering logic

5. **Sample Code**

   * Core components (BLE, form, API calls)

6. **Future Improvements**

   * Scalability
   * AI enhancements

---

## Constraints

* Prioritise MVP feasibility (hackathon scope)
* Avoid overengineering
* Focus on working prototype with clear extensibility

---

## Success Criteria

* Users can submit feedback in under 30 seconds
* BLE trigger works reliably
* Points and rankings update correctly
* Organisers can extract meaningful insights
* Low-quality feedback is effectively separated

---

## Instruction

Proceed step-by-step:

1. Define architecture
2. Design schema
3. Build core flows
4. Implement features
5. Refine UX

Be explicit, structured, and implementation-focused. Avoid vague descriptions.
