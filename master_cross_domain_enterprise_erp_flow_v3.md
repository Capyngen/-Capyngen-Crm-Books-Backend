<USER_REQUEST>
Enterprise ERP Master Business Logic Flow v3 (Books, Billing, Inventory)
Oct 29, 2026 · v2 ke full review ke baad corrected, extended aur operations-ready version
Yeh v3 hai. v2 ke saare 10 pillars, saare lifecycles (Flow 1 se 9), locks, 97+18 feature matrix aur 69 tests rakhe gaye hain. Review me jo bhi galti, contradiction, loophole ya operational atkaav mila, sab fix kiya gaya hai. Do naye flow add hue hain: Flow 10 (Finance Operations: gateway settlement, COD, bank reconciliation, bad debt, fixed assets, year-end) aur Flow 11 (Ground aur Sales Operating Rules: offline, exceptions, negative-stock window, SoD fallback). Goal: Accounts, Sales aur Ground team jab kal is par kaam shuru karein, to koi bhi step aisa na ho jahan kaam ruk jaaye ya log system ke bahar jugaad karein.
Verification note: Tax, GST, TDS, MSME aur RBI ke saare figures aur section numbers time ke saath badalte hain. Inhe config table me rakha gaya hai aur har jagah [VERIFY-CA] tag hai. Go-live se pehle CA aur compliance se sign-off zaroori hai. Is doc ka design enterprise-style hai (SAP-type control thinking); Zoho se sirf feature-set reference liya gaya hai. Zoho jaisa SMB tool kam strict hota hai, isliye v3 me Control Profiles (Section 3.6) add hue hain taaki chhoti company bhi ise chala sake.
1. Purpose aur Scope
Yeh document Books (Accounts), Billing (Subscriptions & Monetization) aur Inventory (Warehousing & Supply Chain) ke beech ka complete operational flow define karta hai.
Har lifecycle me do cheezein hain:
• Positive Flow (Happy Path): Standard ground operations bina rukawat ke kaise execute hoti hain.
• Negative Flow (Loopholes, Edge Cases, Fraud Locks & Blocks): Jahan operator galti kar sakta hai, chori ho sakti hai, ya system crash ho sakta hai, aur ERP ka business logic use kaise block karta hai.
• Exception Flow (naya, v3): Jahan asli duniya me kaam ruk sakta hai (late GRN, API down, offline scanner, approver absent) aur system kaise controlled tareeke se aage badhne deta hai.
Har lock ka Test ID hai (Section 18). Har positive flow ka bhi test hai (Section 18, P-series).
2. V3 Change Log (v2 review ke saare fixes)
#
v2 me problem
v3 me fix
Section
1
ATP = Bins - Committed, jabki Committed me stock bin se nikal chuka tha (double deduct)
Stock model 3 dimension me: Location, Status, Reservation. Reservation alag table, stock move nahi karta. ATP formula corrected
3.2, 3.3, 4.2
2
Invoice dispatch se trigger, par dispatch ko IRN chahiye aur IRN invoice ka hota hai (circular)
Sequence: Pack, Invoice draft, IRN, E-way bill, AWB gate, phir COGS aur Revenue posting. Invoice pack par, posting dispatch par
6.1
3
GRN aur Bill ke beech accrual (GRNI) aur PPV missing
GRN par Dr Inventory / Cr GRNI; Bill par GRNI clear aur PPV
5.1
4
Debit note par ITC turant reverse, GST note kehta tha supplier credit note tak pending
ITC Pending (Rejected Units) account; claim hi nahi hota jab tak supplier credit note na aaye
5.1
5
MSME 45 din, agreement ho to kam (ulta)
Written agreement ho to max 45 din; agreement na ho to 15 din; 43B(h) tracker
5.1, 11
6
Poore bundle par advance GST, aur SSP allocation ko GST value maan liya
GST value aur accounting allocation alag; goods par advance GST nahi, services par advance GST
7.2
7
9-bucket claim, par WIP, RETURN_PENDING_QC, Excess Held waghera extra states
Location, Status, Reservation alag; purane 9 buckets ka mapping table
3.2
8
Excess ke teen naam; transfer me GSTIN rule galat
Do hi defined terms: Rejected at Gate aur Excess Hold. Alag GSTIN par tax invoice, same GSTIN par challan
5.2, 9.1
9
Plan Rs 2,500/month bundle me bhi, aur SaaS SSP bhi Rs 2,500
Plan structure clear: hardware alag, SaaS Rs 2,500/month; do commercial variants
7.1
10
Adjustment approval pending me stock sellable dikhta
Pending adjustment par units turant ADJ_HOLD status
9.3
11
Reservation hoarding, koi expiry nahi
Reservation expiry, aging, auto-release, rep-wise reservation cap
6.2
12
Scrap ka end-to-end flow nahi
Scrap lifecycle: approve, destroy ya sell, witness, GST, GL
9.4
13
COD reconciliation missing
COD remittance reconciliation
14.3
14
Gateway settlement, fee, GST on fee, chargeback missing
Gateway settlement flow
14.2
15
Customer TDS (26AS), bad debt, vendor advance missing
Flow 10 me add
14.4 to 14.6
16
Import flow missing
Import sub-flow: BoE, import IGST, customs, forex payable
5.5
17
Rule 37 ITC reversal aur ITC time limit missing
Compliance flow me add
11
18
E-invoice reporting time limit missing
30-din reporting rule (config)
11
19
Under-delivery, partial receipt, PO close missing
PO partial receipt aur close rules
5.3
20
QC 100% instant maana gaya, AQL nahi
QC sampling (AQL), inspection hold, QC SLA
5.1
21
Short-pick, bin empty, abandoned cart missing
Pick exceptions aur cart timeout
6.4
22
Courier carton-count dispute missing
Carton count reconcile at handover
6.1
23
Dwell-time alerts missing
Zone-wise dwell alerts
15.6
24
Collusion (do log milke fraud) cover nahi
Collusion analytics aur rotation rules
13.8
25
Sales ko future availability nahi dikhti
Future ATP aur Promise Date
3.3, 6.5
26
Credit hold release ka SLA nahi
Release SLA, escalation, emergency window
6.2
27
Ship Complete orders ka visibility nahi
Hold-reason dashboard, partial approval option
12.1
28
Quote validity, price lock thin
Quote validity, price lock, SO price rules
6.1
29
Period lock rigid
Soft close, hard close, module-wise lock, audit-adjustment period
9.5
30
Rounding rules missing
Invoice-level rounding, paise split rules
11
31
Fixed assets, bank rec, inter-company, year-end sirf matrix me
Flow 10 me proper flow
14
32
Invoice date, posting date, GST time of supply ek maan liye
Three Dates rule
3.7
33
Control transfer default DISPATCH
Per-contract flag, onboarding me forced selection, auditor sign-off
6.1
34
Bahut scan hops
Mandatory aur optional scan points, lean mode
15.2
35
Offline mode missing
Offline scan queue aur sync-conflict rules
15.3
36
Negative stock hard-block se kaam ruke
Provisional Receipt aur controlled exception window
15.4
37
SoD ke liye headcount chahiye
Small-team mode aur compensating controls
13.1, 15.5
38
Har Rs 5,000+ par SVP aur FD
Tiered approval ladder
9.2
39
Barcode damage, UoM, batch capture, bulk serial, count freeze missing
Ground exceptions table
15.7
40
Hot SKU contention (WriteConflict)
Ledger-style movements plus derived balance, per-SKU queue
13.3
41
Global hash chain bottleneck
Per-warehouse, per-day chain with anchor
13.5
42
Debit=Credit sirf app-level
Posting service ke through hi write, DB role lock, daily independent check
13.3
43
Mongo transaction limits
Small transactions, saga aur compensation
13.3
44
Credit counter drift
Counter ledger se derived, daily recompute
6.2
45
Pre-debit notice timeline conflict
Invoice D-3, notice D-2, charge D-0
7.4
46
Proration edge cases missing
First month, calendar vs anniversary, metered, coupon, annual-to-monthly
7.3
47
Tests sirf negative locks ke
Positive flow tests aur matrix-feature tests add
18
48
Source of truth matrix missing
Master Data Ownership matrix
3.5
49
Zoho se zyada strict, usability risk
Control Profiles: Lite, Standard, Strict
3.6
50
Tax points memory-based
Har tax point par VERIFY-CA tag aur config parameter table
11.0
Correction record: v2 me vendor bill ka example sahi tha (95 accepted units Rs 2,66,000, 5 rejected Rs 14,000). v3 me wahi numbers rakhe gaye hain, bas GRNI aur ITC Pending ke saath journal sahi kiya gaya hai.
Assumptions: Currency INR; GST regime India; Ind AS 115 / IFRS 15 aligned; stack MongoDB-based (GL ke liye relational DB bhi acceptable option, Section 13.3). Saare rates, thresholds aur limits versioned config table me hain.
3. Master Cross-Domain Integration Architecture
Teeno domains ek hi event stream se jude hain: ek physical ya commercial event ek jagah hota hai, aur baaki domains par uska asar defined, atomic aur auditable hota hai.
3.1 Kaun sa event kis domain ko kya karta hai
Event
Inventory par asar
Books par asar
Billing par asar
Purchase Order issue
Expected Incoming Supply badhta hai; physical stock 0; Future ATP me promise date ke saath
Koi posting nahi (commitment only)
Koi nahi
Gate entry plus dock count
INBOUND_DOCK location me stock, status QC_HOLD ya PENDING_PUTAWAY
Koi posting nahi
Koi nahi
GRN post (accepted qty)
Stock received, valued
Dr Inventory / Cr GRNI (PO price par)
Koi nahi
QC reject
Status QUARANTINE, return-to-vendor
Debit note claim record; GL posting bill ke saath
Koi nahi
Putaway bin scan
STORAGE_BINS, status AVAILABLE, ATP unlock
Valuation confirm
Koi nahi
Vendor Bill
Koi nahi
Dr GRNI, PPV, Input GST / Cr AP
Koi nahi
Sales Order confirm
Reservation banti hai; stock bin me hi
Koi posting nahi; credit reservation
Quote ya subscription se link
Pack complete
Stock PACKING_TABLE par
Tax Invoice draft, IRN, e-way bill; Dr AR / Cr Output GST / Cr Sales Clearing
Invoice cycle start (hardware)
Courier AWB manifest (control transfer)
Physical deduct, reservation closed
Dr COGS / Cr Inventory; Dr Sales Clearing / Cr Revenue
Fulfillment complete
Subscription cycle trigger
Hardware ho to Fulfillment Order
Advance invoice, Deferred Revenue
Invoice, dunning, proration
Gateway webhook (payment)
Koi nahi
Gateway Clearing, AR clear
Payment allocation
Gateway settlement
Koi nahi
Bank Dr, fee, GST on fee, TCS/TDS, Clearing Cr
Reconciled flag
Work Order gates
Bins se WIP, WIP se FG
Dr FG / Cr WIP
Koi nahi
Return ya RTO
RETURN_DOCK, status RETURN_PENDING_QC, phir restock ya scrap
Credit Note, COGS reversal
Credit balance
Period close
Koi nahi
Soft close, phir hard close
MRR snapshot freeze
3.2 Stock Model v3: Location, Status, Reservation (9-bucket ka sahi design)
v2 me location (cart, packing table) aur status (committed, quarantine) ek hi bucket list me mix the, isi se formula bigda. v3 me teen alag dimension hain:
Dimension 1: Location (maal physically kahan hai)
INBOUND_DOCK, QC_AREA, STORAGE_BINS (bin-level, e.g. BIN-RACK-B04), PICK_CART, PACKING_TABLE, OUTBOUND_BAY, TRANSIT_INTERWH (hub se hub), SCRAP_BAY, WIP_SHOP_FLOOR, RETURN_DOCK, CUSTOMER_TRANSIT (dispatch ke baad, jab control delivery par transfer hota hai), RTO_TRANSIT (courier ke paas wapsi).
Dimension 2: Status (maal ki halat)
AVAILABLE, QC_HOLD (inspection pending), QUARANTINE (QC fail), ADJ_HOLD (adjustment approval pending), EXCESS_HOLD (over-delivery, no value), UNDER_INVESTIGATION (transit loss ya mismatch), RETURN_PENDING_QC, REWORK, DAMAGED.
Dimension 3: Reservation (kiske liye roka gaya)
Alag table: SO line, qty, owner, created time, expiry, type (Soft ya Hard), status (Active, Picked, Released, Expired). Reservation stock ko move nahi karti; sirf ATP kam karti hai.
Stock record = (item, batch/serial, location, status, qty). Har move ledger entry hai: from (location, status) se to (location, status), qty, user, reason, document, timestamp. Sellable rule: location = STORAGE_BINS (sellable bin) AND status = AVAILABLE.
Purane 9 buckets ka mapping (kuch bhi chhoota nahi):
v2 bucket
v3 me kya hai
INBOUND_DOCK
Location INBOUND_DOCK; ATP me nahi
QUARANTINE_QC
Location QC_AREA ya QUARANTINE zone, Status QC_HOLD ya QUARANTINE; ATP me nahi
STORAGE_BINS
Location STORAGE_BINS, Status AVAILABLE; ATP me haan
COMMITTED
Ab bucket nahi; Reservation table hai
PICKED_CART
Location PICK_CART
PACKING_TABLE
Location PACKING_TABLE (company ka asset)
OUTBOUND_BAY
Location OUTBOUND_BAY
IN_TRANSIT
Location TRANSIT_INTERWH
SCRAP_BAY
Location SCRAP_BAY
WIP_SHOP_FLOOR, RETURN_PENDING_QC, Excess Held, Under Investigation, Goods in Transit to Customer
Ab formally defined Location ya Status hain
3.3 ATP aur Future ATP
• ATP = Sellable On-Hand (STORAGE_BINS aur AVAILABLE) - Unpicked Active Reservations
• Example: bin me 50, unpicked reservations 20, ATP = 30. Picking ke baad 5 units cart me gayi: bin 45, unpicked reservation 15, ATP phir 30 (double deduct nahi).
• Future ATP (sales promise) = ATP + confirmed incoming (PO with promise date, Work Order output date) - reservations jinki delivery date us window me hai. Yeh promise hai, reservation nahi; sales ise quote par Expected Availability Date ke roop me dikha sakti hai.
• ADJ_HOLD, QC_HOLD, QUARANTINE, EXCESS_HOLD, UNDER_INVESTIGATION status ke units ATP me kabhi nahi aate.
3.4 Platform Design Principles
• Immutable ledgers: Stock ledger aur GL kabhi edit ya delete nahi; sirf reversal ya contra.
• Atomic posting: Stock movement, stock ledger aur GL ek hi transaction (ya saga with compensation, Section 13.3); crash par poora rollback.
• Idempotency: Har webhook, API call aur posting par idempotency key; device-generated key offline scans ke liye bhi.
• Segregation of Duties: Banane wala approve nahi karta; chhoti team ke liye compensating controls (13.1).
• Configuration over hardcode: Tax, thresholds, tolerances, shelf-life, dunning days, approval tiers sab versioned config me.
• Event-driven integration: Outbox pattern, retry, dead-letter.
• Exception-first design (naya): Har gate ka ek controlled exception path hai, taaki kaam system ke andar hi chale.
3.5 Master Data Ownership (Source of Truth)
Ek document ka ek hi owner domain hota hai; baaki domains sirf reference ya read-only copy rakhte hain. Isse double posting rukti hai.
Document / Master
Owner domain
Baaki domains ka role
Item master (HSN, tax, UoM, valuation method)
Inventory
Books aur Billing read-only; tax mapping Books se
Customer master (GSTIN, credit limit, terms)
Books
Billing aur Sales read; credit exposure Books calculate karta hai
Vendor master (bank, MSME, TDS category)
Books
Inventory read
Purchase Order
Inventory (Procurement)
Books commitment view only
GRN, Stock ledger, Reservation
Inventory
Books posting inventory se leta hai
Vendor Bill, Debit/Credit Note (vendor), Payments Made
Books
Inventory GRN link
Quote, Sales Order
Sales (Inventory fulfilment ke saath)
Books credit check
Delivery Challan, Dispatch
Inventory
Books posting
Tax Invoice (one-time sales)
Books
Inventory dispatch link
Subscription, Plan, Recurring invoice, Dunning, Proration
Billing
Books posting aur Inventory fulfilment order
Credit Note (customer)
Books (return se link Inventory ka)
Billing credit balance
Payments Received, Gateway settlement
Books
Billing allocation
Timesheets, Projects
Billing
Books posting
Manual Journal, COA, Period lock
Books
Sab domains lock follow karte hain
Rule: matrix me jo feature teen domains me dikhta hai, woh teen alag implementation nahi, ek owner aur do read-views hain.
3.6 Control Profiles (Zoho-type usability ke liye)
Strict controls har company ke liye ek jaise nahi chalte. Profile config se set hota hai; Strict profile ke saare locks Standard me bhi mandatory hain jo paisa ya tax se jude hain (ledger immutability, idempotency, atomic posting, GST sequence).
Control
Lite (chhoti team)
Standard
Strict (bada, audit-heavy)
SoD
Compensating control: same user low value par allowed, next-day manager review
Alag users, delegate allowed
Role-assignment block plus runtime
Adjustment approval
Manager 1 level
Tiered (Section 9.2)
Tiered plus dual executive above top tier
Scan points
Mandatory gates only
Mandatory plus risk-based
Sab hops
Period close
Soft close monthly
Soft plus hard
Soft, hard, module-wise, dual unlock
QC
Sample ya 100% simple
AQL sampling
AQL plus lot-wise inspection plan
3.7 Three Dates Rule
Har document ki teen alag dates hain aur system teeno alag rakhta hai:
1. Document date (invoice date, bill date): commercial document par jo likha hai.
2. Posting date (GL date): kis accounting period me entry girti hai; lock date isi par lagti hai.
3. Tax time of supply (GST): GST law ke hisaab se goods ke liye invoice ya removal ki earlier date, services ke liye invoice ya payment ki earlier date [VERIFY-CA]. GSTR-1 aur GSTR-3B isi se chalte hain.
Revenue recognition date (Ind AS 115 control transfer) chauthi, alag date hai aur usi se COGS aur Revenue ka posting date decide hota hai. 31st ko dispatch hua par 2nd ko post hua: posting date 31st (soft-close window ke andar, Section 9.5), taaki cut-off sahi rahe.
4. Standard Business Logic: Kya Hona Chahiye vs Kya Hai
Neeche 10 Golden Pillars hain. 'Kya Hona Chahiye' me accepted accounting aur supply-chain practice ka principle hai (SAP-type systems, Ind AS 115 / IFRS 15, GST law). 'Kya Hai' me hamare code aur database ka v3 implementation hai. 9 buckets, Rs 5,000 threshold jaise specifics kisi standard ne prescribe nahi kiye; yeh best-practice inspired design choices hain jo configurable hain.
#
Ground Pillar
Kya Hona Chahiye? (Principle)
Kya Hai? (v3 implementation)
1
Physical Stock Identity
Stock kabhi single integer nahi; maal hamesha physical jagah aur halat ke saath track ho.
Location + Status + Reservation (Section 3.2). Double-entry stock ledger; har move ka immutable record: from, to, qty, user, reason, document, timestamp.
2
ATP and Sales Gate
Untested ya dock ka maal sales nahi bech sakti. Bin putaway ke bina ATP zero.
ATP = Sellable On-Hand (STORAGE_BINS + AVAILABLE) - Unpicked Reservations. Dock, QC, Quarantine, ADJ_HOLD ATP se hard-excluded. Bin scan par hi ATP unlock. Future ATP alag (promise only).
3
Zero Overselling
SO aate hi maal rack se nahi katna chahiye, par reserve hona chahiye taaki doosra na beche.
Reservation table: SO confirm par reservation banti hai, stock bin me hi rehta hai. Atomic, expiry ke saath (Section 6.2).
4
Stock Derecognition and COGS
Sealed box packing table par bhi company ka asset hai. Control transfer par hi deduct aur COGS.
AWB Courier Manifest Gate: dispatch confirm par physical deduct, reservation close, Dr COGS / Cr Inventory, Dr Sales Clearing / Cr Revenue. Control transfer point per-contract flag (dispatch ya delivery). Invoice pehle (pack par) banti hai, posting control transfer par.
5
Dock Intake and Tolerance
PO par 0 physical impact. Over-delivery par cap (+5%). Defective par vendor debit note.
105% tak accept; upar Rejected at Gate ya Excess Hold. GRN par GRNI accrual. Defect units QUARANTINE aur debit note claim; ITC sirf supplier credit note ke baad reverse (ITC Pending account).
6
Revenue Recognition (Ind AS 115 / IFRS 15)
Advance par Day-1 profit nahi. Deferred Revenue liability. Bundle price SSP ke ratio me allocate.
Deferred Revenue Engine. Hardware point-in-time, SaaS over-time. GST value alag, accounting allocation alag (Section 7.2). Month-end Dr Deferred Revenue / Cr Realized Revenue.
7
Proration and Mid-Cycle Changes
Upgrade par remaining days ka delta; unused credit adjust.
Exact Day Proration Engine, first month, anniversary vs calendar, coupons, metered usage rules (Section 7.3). Downgrade par credit balance.
8
Smart Dunning and Collections
Card fail par gateway spam nahi. Exponential backoff. RBI e-mandate rules follow.
Retry Day 0, 3, 7, 10 (configurable). Har attempt se pehle pre-debit notice. Invoice D-3, notice D-2, charge D-0. Uske baad Suspended.
9
Internal Theft and Shrinkage Gate
Storekeeper khud write-off na kare. High value par executive sign-off. Splitting se bachav.
Tiered approval ladder (Section 9.2), cumulative limits, maker-checker, aur pending adjustment ke turant ADJ_HOLD (Section 9.3).
10
Double-Entry Financial Invariance
Debit aur Credit kabhi mismatch nahi. Har movement auditable.
Sum Debits == Sum Credits har posting par. Sirf central posting service write kar sakti hai; entries immutable; daily independent check (Section 13.3).
4.1 Pillar 7 ka Proration Formula
Delta = (Days Left / Total Days x New Rate) - (Days Left / Total Days x Old Rate)
Delta positive ho to delta invoice banta hai. Delta negative (downgrade) ho to difference Customer Credit Balance me jaata hai aur next invoice me adjust hota hai.
4.2 Pillar 2 ka ATP Formula (corrected)
ATP = Sellable On-Hand (STORAGE_BINS aur AVAILABLE) - Unpicked Active Reservations
Future ATP = ATP + Confirmed Incoming (PO ya Work Order, promise date ke saath) - Reservations us window ki.
4.3 Pillar 10 ka Invariant
Sum of Debits = Sum of Credits (har posting batch par, aur daily trial-balance par).
5. Lifecycle Flow 1: Procure-to-Pay (P2P) and Inbound Supply Gate
Flow: Purchase Order, Gate Entry Pass, Dock Intake and 3-Way Match, QC (AQL sampling) Split, GRN and GRNI, Putaway to Bin, Vendor Bill, Supplier Credit Note, Payment.
5.1 Positive Flow (Happy Path)
1. PO Generation: Procurement manager approved vendor ke saath PO issue karta hai. Physical stock 0 aur Rs 0 ka GL impact; sirf Expected Incoming Supply (promise date ke saath, Future ATP me dikhta hai). PO me price, qty tolerance (+5% over, under-delivery tolerance e.g. -5%), price variance limit, delivery schedule, UoM (purchase UoM aur stock UoM conversion factor) hota hai. Vendor MSME hai ya nahi, PO par flag aata hai.
2. Truck Arrival and Gate Pass: Guard PO number se vendor challan match karke Gate Entry banata hai. Vendor invoice ka IRN (jahan applicable) aur e-way bill validity yahin check hoti hai. Docs missing hon to truck Rejected at Gate (Section 5.2).
3. Dock Intake (3-Way Match): Dock supervisor boxes count karta hai; PO qty, vendor challan aur physical count match hote hain. Maal INBOUND_DOCK location par aata hai, status QC_HOLD (QC applicable ho to) ya PENDING_PUTAWAY. Batch aur expiry scan ya double-entry se capture hote hain.
4. QC (Sampling, AQL): Item category par inspection plan: 100% inspection ya AQL sample. Inspection pending maal QC_AREA me QC_HOLD status me rehta hai (ATP me nahi). QC SLA config hai (e.g., 24 ghante); SLA breach par alert. Sample fail par poora lot reject ya 100% screening, plan ke hisaab se. Example: 100 units aayi; 95 pass, 5 fail.
5. GRN Post (Accepted Quantity): Pass hui 95 units par GRN post hoti hai, PO price par valuation: Dr Inventory Rs 2,66,000 / Cr GRNI (Goods Received Not Invoiced) Rs 2,66,000. Fail 5 units: status QUARANTINE, alag barcode, Return-to-Vendor challan, aur Vendor Debit Note claim Rs 14,000 (is stage par inventory ya GL me nahi, sirf claim record).
6. Directed Putaway: Forklift driver ke scanner par Putaway Task (BIN-RACK-B04). Bin barcode scan karke slotting confirm. QC user aur putaway user alag (SoD, 13.1).
7. ATP Activation: Bin scan hote hi 95 units STORAGE_BINS + AVAILABLE ho kar ATP me aati hain.
8. Vendor Bill (Financial Booking): Vendor ne 100 units ka bill diya (Rs 2,800/unit, GST 18%, same-state). Vendor ka bill legal document hai, isliye AP me poora book hota hai, par rejected portion ka cost aur ITC alag parked hota hai:
    ◦ Dr GRNI Rs 2,66,000 (accepted 95 units)
    ◦ Dr Vendor Return Receivable Rs 14,000 (rejected 5 units)
    ◦ Dr Input CGST Rs 23,940 aur Input SGST Rs 23,940 (accepted units ka ITC, claimable)
    ◦ Dr ITC Pending (Rejected Units) Rs 2,520 (rejected ka GST, claim nahi hota)
    ◦ Cr Accounts Payable - Vendor Rs 3,30,400
    ◦ Check: 2,66,000 + 14,000 + 47,880 + 2,520 = 3,30,400.
9. Supplier Credit Note (Sec 34): Jab supplier rejected units ka credit note deta hai: Dr Accounts Payable Rs 16,520 / Cr Vendor Return Receivable Rs 14,000 / Cr ITC Pending Rs 2,520. Net result: Inventory Rs 2,66,000, Input GST claimable Rs 47,880, AP Rs 3,13,880 (v2 ke numbers se match). Jab tak supplier credit note na de, ITC Pending claim nahi hota aur follow-up reminder chalta hai. Agar ITC kisi wajah se pehle claim ho gaya ho to GSTR-3B me reverse hota hai [VERIFY-CA].
10. Price Variance (PPV): Bill rate aur PO rate ka fark tolerance ke andar ho to PPV account me (standard cost) ya inventory cost me (actual/WAC) jaata hai, valuation method ke hisaab se. Tolerance ke upar bill Blocked for Variance (lock 1.5).
11. Vendor Payment: NEFT/RTGS. TDS section aur rate vendor category rate-table se aata hai, hardcode nahi. Goods par normally TDS nahi jab tak purchase-threshold wali provision trigger na ho [VERIFY-CA]. Income-tax Act 2025 (1 April 2026 se) ke baad section numbers badle hain; config table me rakhe jaate hain. Vendor advance ho to PO ke against hi (lock 1.13) aur bill ke against adjust.
12. MSME Payment Rule: MSME (micro ya small) vendor ko payment: written agreement ho to max 45 din, agreement na ho to 15 din (MSMED Act). Tracker due date par alert deta hai. Income-tax 43B(h): late payment par deduction paid-basis par shift ho sakta hai, isliye MSME aging report year-end se pehle Finance ko jaati hai [VERIFY-CA].
13. GRNI Control: Period-end par GRN-hua-bill-nahi wala maal GRNI account me accrued rehta hai (cut-off sahi). GRNI aging report har hafte: 30 din se purani lines par investigation (bill late ya GRN galat).
5.2 Over-Delivery: Defined Terms (naming fix)
Term
Matlab
Stock / GL asar
Accepted
PO qty + tolerance (105%) ke andar
Normal GRN
Rejected at Gate
Tolerance ke upar ka maal truck se utara hi nahi gaya
Koi stock, koi liability; Rejected at Gate record aur gate challan
Excess Hold
Galti se utar gaya, tolerance ke upar
Status EXCESS_HOLD, valued Rs 0, ATP me nahi, bill me nahi; return-to-vendor challan banta hai
System 105 units tak accept karta hai; 106vi unit scan par 422 aata hai aur upar ke do tareeke (Rejected at Gate ya Excess Hold) me se ek apply hota hai.
5.3 PO Partial Receipt, Under-Delivery aur PO Close
• PO line par Ordered, Received, Rejected, Billed counters rehte hain. Partial receipt allowed hai; PO Partially Received status me rehta hai aur baaki Expected Incoming Supply me dikhta hai.
• Under-delivery tolerance (config, e.g. -5%) ke andar PO auto-close prompt; upar ho to Procurement approval ke saath Short Close, reason code ke saath. Vendor ko short-supply notice jaata hai.
• Closed ya Short-Closed PO par naya GRN block; naya PO banana padega.
• PO close hone par uska Expected Incoming Supply Future ATP se hat jaata hai.
• Close ke baad aaya bill dispute queue me jaata hai.
5.4 Negative Flow (Loopholes, Fraud and System Locks)
#
Ground Loophole / Fraud Attack
Negative Scenario Kya Hoga?
ERP Standard Business Logic Lock (v3)
1.1
Over-Delivery Vendor Fraud
PO 100 ka tha; vendor ne storekeeper ke saath milkar 150 bheje.
Over-delivery Tolerance Gate (+5%): max 105 receive. Extra units par 422. Rejected at Gate ya Excess Hold (5.2); excess ka koi bill nahi.
1.2
Dock-to-Sales Leakage
Sales ne dock par 100 units dekhi aur QC se pehle bech di.
Zero ATP at Dock: dock, QC_HOLD, QUARANTINE ATP me nahi. Order par Error: 0 units available for sale.
1.3
Damaged Stock Inventory Inflation
QC inspector ne 5 defective units bina report kiye shelf par rakh di.
Quarantine segregation: alag barcode aur zone; putaway engine sellable bin me slot karne se mana karta hai.
1.4
Double Bill Payment Fraud
Ek vendor invoice do baar enter.
Unique composite index (vendor invoice no + PAN/GSTIN + financial year). Repeat par 409 Duplicate Vendor Invoice.
1.5
Price Variance Fraud
Bill rate PO se zyada, bina question pass.
3-Way price tolerance (e.g., 2%). Upar bill Blocked for Variance; Procurement Head approval ke bina payment run me nahi.
1.6
Bill Before Goods (Ghost Receipt)
Bill book hua par maal aaya hi nahi.
Bill sirf GRN-matched qty tak clear hota hai. GRN ke bina Hold aur payment block.
1.7
Vendor Bank Detail Change Fraud
Fraudster bank account badalta hai.
Maker-checker, callback verification, pehle payment par 48-hour cooling hold.
1.8
One-Person PO-to-Payment
Ek user PO, GRN aur payment approve karta hai.
SoD: PO creator, GRN poster, payment approver alag (13.1).
1.9
Expired / Short-Dated Receipt
Vendor near-expiry batch bhejta hai.
Dock par minimum remaining shelf life rule; fail par QUARANTINE aur debit note ya return.
1.10
Silent Short Supply
PO close kar diya jab vendor ne kam bheja, claim nahi.
Short Close approval, reason code, vendor notice; open balance bina approval ke close nahi.
1.11
QC Sampling Bypass
Inspector sample hi nahi nikalta ya 100% pass maarta hai.
AQL plan lot-wise mandatory; sample size aur result recorded; sample na ho to GRN post nahi.
1.12
Stale GRNI
GRN ho gaya par bill mahino tak nahi aaya; liability dabi hui.
GRNI aging alert (30 din); period-end accrual; vendor follow-up task.
1.13
Vendor Advance Misuse
Advance diya par PO ya bill se link nahi.
Advance sirf PO ke against; aging aur adjust-against-bill rule; unlinked advance par alert.
1.14
ITC on Rejected Units
Rejected units ka ITC claim ho gaya.
ITC Pending account; supplier credit note tak GSTR-3B me claim nahi; GSTR-2B match.
1.15
MSME Late Payment
MSME vendor ka payment tracker miss.
Due-date tracker (45 ya 15 din), escalate alert, payment run me priority.
1.16
UoM Conversion Error
Box me 12 pcs, receive me 1 box ko 1 pc maana.
Item UoM table (purchase, stock, sales, conversion factor); GRN me UoM mandatory aur preview.
5.5 Import Purchase Sub-Flow
1. Foreign-currency PO (USD, etc.); advance ya LC/TT payment ho sakta hai; forex rate authorized rate table se (Section 12.4).
2. Port par Bill of Entry (BoE): customs duty (BCD, SWS), import IGST. Goods tab hi receive maane jaate hain jab customs clearance ho.
3. Landed cost: goods value + BCD + SWS + freight + insurance + clearing charges. Import IGST ITC me jaata hai (claimable), cost me nahi.
4. Example (rates illustrative [VERIFY-CA]): goods Rs 83,000 (USD 1,000 at Rs 83), BCD 10% = Rs 8,300, SWS 10% of BCD = Rs 830, assessable value Rs 92,130, import IGST 18% = Rs 16,583.40. Inventory landed cost = Rs 92,130 + freight; Input IGST Rs 16,583.40 alag.
5. Forex payable: invoice date rate par book, month-end revaluation, payment date par realized forex gain ya loss.
6. BoE ke bina GRN post nahi; BoE number par unique index (duplicate import duty claim nahi).
5.6 Exception Flow (Late GRN aur Dock Pressure)
Maal dock par aa gaya par PO ya GRN ready nahi: Provisional Receipt (Section 15.4): stock QC_HOLD status me, valued Rs 0, ATP me nahi, 24 ghante ke andar PO match ya Rejected at Gate. Isse dock par kaam ruke nahi aur sales ko galat ATP bhi nahi dikhe.
6. Lifecycle Flow 2: Order-to-Cash (O2C) and Outbound Fulfillment Gate
Flow: Quote, Sales Order, Credit Check and Reservation, Pick, Pack, Invoice and IRN and E-way Bill, Courier Dispatch (control transfer), Revenue and COGS Posting, Payment.
6.1 Positive Flow (Happy Path, corrected sequence)
1. Commercial Quote: Sales rep price, discount, payment terms aur validity date ke saath quote bhejta hai. Quote par Expected Availability Date (Future ATP se) dikhti hai. Price quote validity tak locked hai; validity ke baad re-price. Discount matrix se upar manager approval (lock 2.6).
2. 1-Click Conversion to Sales Order: Quote accept hone par SO banta hai. SO price quote price se neeche tabhi jaa sakta hai jab approval ho.
3. Credit Check and Reservation: Pehle credit check (6.2), phir ATP check. ATP kaafi ho to Reservation banti hai (stock bin me hi rehta hai) with expiry (6.3). Example: bin me 50, unpicked reservations 20, ATP 30; doosra salesperson in 20 ko nahi bech sakta.
4. Picking Wave: Scanner bin aur SKU verify karta hai (batch ya serial wale items me batch/serial bhi), FEFO order me. Stock bin se PICK_CART location par jaata hai, reservation Picked mark hoti hai. Exceptions: 6.4.
5. Packing and Tamper Sealing: Pack-time scan (SKU + qty + weight tolerance). Tamper-evident seal. Stock PACKING_TABLE par; maal abhi bhi company ka asset hai.
6. Tax Invoice, IRN, E-way Bill (pack complete par):
    ◦ Tax Invoice draft banta hai sirf dispatch-ready qty par.
    ◦ Jahan e-invoice applicable hai: IRP se IRN aur QR milne par invoice Final [VERIFY-CA].
    ◦ Consignment value Rs 50,000 se upar ho to e-way bill generate [VERIFY-CA].
    ◦ Invoice Final hone par GL: Dr Dispatch Clearing Rs 94,400; Cr Output GST Payable Rs 14,400; Cr Sales Clearing Rs 80,000 (Selling price Rs 4,000/unit x 20, GST 18%). Abhi Revenue aur AR nahi, kyunki control transfer nahi hua.
    ◦ Invoice Final hone ke baad dispatch ki time window (config, default 24 ghante, e-invoice cancel window ke barabar) hai. Window me dispatch na ho to alert: IRN cancel karo ya dispatch karo; window ke baad sirf credit note.
7. Courier Handover: The Golden Gate (control transfer, DISPATCH mode): Courier truck gate par aati hai. AWB manifest scan, carrier API se Pickup Manifest Token, IRN aur e-way bill validity check. Carton count reconcile: manifest me cartons = driver ko diye gaye cartons; driver digital signature ya OTP se count confirm karta hai; mismatch par dispatch hold aur dispute record. Maal gate se nikalte hi:
    ◦ Physical stock deduct (-20 units), reservation Closed.
    ◦ Dr Cost of Goods Sold Rs 60,000 / Cr Inventory Asset Rs 60,000 (cost Rs 3,000/unit).
    ◦ Dr Accounts Receivable Rs 94,400 / Cr Dispatch Clearing Rs 94,400.
    ◦ Dr Sales Clearing Rs 80,000 / Cr Sales Revenue Rs 80,000.
    ◦ Gross margin Rs 20,000 (25% of revenue). COGS aur Revenue ek hi dispatch event se ek hi period me.
8. Payment and Allocation: Payment aane par invoice allocate hota hai, credit exposure release hota hai. Customer ne TDS kaata ho to Section 14.4.
9. Rounding: Invoice-level round-off ek alag Round-Off account me; CGST aur SGST ka paise split: pehle CGST round karo, SGST = total GST - CGST taaki dono barabar rahe; rule config me.
Control Transfer Config (per contract, default hardcode nahi): Onboarding wizard me har customer ya contract ke liye choice forced hai (skip nahi hota):
• DISPATCH: Control shipping point par transfer (ex-works, customer ka freight aur risk). Upar wala flow.
• DELIVERY: Seller delivery tak risk uthata hai (aksar domestic courier sales). Dispatch par stock CUSTOMER_TRANSIT me, Dr Goods in Transit to Customer / Cr Inventory (cost par). Courier Delivered status ya POD par: Dr AR / Cr Dispatch Clearing; Dr Sales Clearing / Cr Revenue; Dr COGS / Cr Goods in Transit. Delivery confirm na ho to N din (config) baad auto-investigation.
• Kaun sa mode kis customer segment par lagega, yeh Finance aur auditor ke saath Ind AS 115 policy me document hota hai; system me koi global default hardcoded nahi. Bina choice ke customer activate nahi hota.
6.2 Credit Limit Rule (precise definition)
Exposure = Unpaid Invoices + Open Reservations-backed SOs (not yet invoiced) + Dispatch Clearing balance - Unapplied Advances
SO confirm tabhi hoga jab Exposure + SO Total <= Credit Limit. Post-dated cheques clear hone tak exposure me rehte hain.
• Atomic reservation: Credit-used counter conditional update se badhta hai; do simultaneous SO dono pass nahi ho sakte.
• Counter drift control: Credit-used counter ledger se derived hai (open SO, invoices, payments se); SO cancel, partial invoice, SO edit, reservation expiry par auto-release; daily recompute job counter aur ledger match karta hai, mismatch par alert aur auto-correct entry.
• Credit Hold Release SLA: Hold par SO Finance queue me jaata hai; SLA 4 business hours (config); breach par Finance Head ko escalation; month-end par priority queue. Emergency: Sales Head temporary limit increase request kar sakta hai (max X% aur 48 ghante), approve sirf Finance. Rep kabhi release nahi kar sakta.
• Customer ko hold ka reason aur expected resolution time dikhta hai, taaki sales side-channel (WhatsApp, Excel) na dhundhe.
6.3 Reservation Rules (Hoarding ke against)
Rule
Detail
Soft vs Hard
Soft: quote ya pre-book, short expiry (default 48 ghante), ATP kam karti hai par priority kam. Hard: confirmed SO.
Scheduled delivery
SO ki delivery date door ho to reservation delivery se T-3 din pehle hi hard hoti hai (lead window config). Tab tak Future ATP me promise.
Unpaid advance-terms SO
Payment terms advance ho aur payment 48 ghante me na aaye to reservation auto-release.
Aging
Confirmed, unshipped SO par 7 din me rep reminder; 15 din me auto-release jab tak customer ya manager confirm na kare. Din config hain.
Rep-wise cap
Ek rep ki total active reservation value par cap aur alert.
Release priority
Released stock backorder queue (FIFO ya priority rule) me jaata hai (Section 12.1).
6.4 Pick Exceptions (Ground ko rukna nahi chahiye)
• Short-pick: Bin me system qty > physical. Picker Short Pick button se report karta hai; system alternate bin (same batch, FEFO order) suggest karta hai; partial pick reason code ke saath allowed; reservation re-allocate; us bin ka priority recount task banta hai. Variance adjustment value ke hisaab se tiered approval (9.2), aur tab tak bin ADJ_HOLD.
• Bin empty ya wrong bin: Same flow; bar-bar short-pick karne wale picker par analytic alert (13.8).
• Pick-time batch mismatch: Scan block; FEFO ke andar valid batch suggest.
• Abandoned cart: PICK_CART me stock N ghante (default shift end) se zyada ho to alert. Shift end par cart sweep mandatory: cart ka maal pack ho ya bin me Return-to-Bin task se wapas jaaye; supervisor sign-off.
• Carton count dispute (pickup par): Courier ne kam cartons liye to manifest par mismatch; sirf scanned aur signed cartons deduct hote hain; baaki OUTBOUND_BAY me hold.
6.5 Sales Visibility (Sales ko kaam karne ke liye)
• ATP aur Future ATP dono dikhte hain; stock-out par Expected Availability Date quote me automatic.
• Hold dashboard: har SO ka hold reason (Credit, Stock, Ship Complete, Approval) aur owner dikhta hai.
• Quote me price lock aur validity; expire quote ka re-price one-click.
6.6 Negative Flow (Loopholes, Fraud and System Locks)
#
Ground Loophole / Fraud Attack
Negative Scenario Kya Hoga?
ERP Standard Business Logic Lock (v3)
2.1
Phantom Negative Stock
Shelf par 5 units, do salespeople ne 5-5 order kiya.
Atomic reservation (per-SKU serialized ya conditional update). Pehli pass, doosri 409 Conflict: Insufficient physical stock. Multi-line order ek transaction ya saga me; ek line fail to poora rollback.
2.2
Defaulting Customer Credit Breach
Rs 10,00,000 overdue, limit Rs 5,00,000, rep ne commission ke liye approve kiya.
Hard Credit Gate: Exposure + SO.total > Limit par SO auto-lock On Hold: Credit Limit Exceeded; release sirf Finance.
2.3
Expired Goods Dispatch
Picker ne 7 din me expire hone wala batch uthaya.
FEFO Hard Stop: minimum remaining shelf life product-wise aur customer-wise config (default 7 din, ya jaise 80% shelf life). Rule-fail batch par red beeper aur manifest block.
2.4
Unpacked / Lost in Transit Stealing
Worker ne bola truck me daal diya, truck aayi hi nahi.
Mandatory Courier AWB Integration: Pickup Manifest Token ke bina deduct nahi. API down ho to controlled manual override (13.6).
2.5
Credit Race Condition
Do reps ek customer par ek sath SO confirm karte hain.
Atomic credit reservation; doosre ko 409 Credit Reservation Conflict.
2.6
Discount / Price Override Abuse
Rep rishtedar ko sasta bechta hai.
Discount matrix, price floor (minimum margin) ke neeche SO block, sab override audit-logged aur reason code zaroori.
2.7
Wrong Item / Qty Dispatch
Picker galat SKU ya qty pack karta hai.
Pack-time scan (SKU + qty + weight tolerance). Mismatch par seal nahi.
2.8
Partial Dispatch Revenue Mismatch
Aadhe items gaye, poora invoice bana.
Invoice sirf dispatch-ready qty par; baaki backorder (12.1).
2.9
Returned / Failed Delivery
Delivery fail ya customer ne reject kiya.
RTO ya RMA flow (Section 10).
2.10
Reservation Hoarding
Rep order confirm karke maal roke rehta hai.
Reservation expiry, aging auto-release, rep-wise cap (6.3).
2.11
Invoice-Dispatch Gap
Invoice final hui par maal gate se gaya hi nahi (ya bina invoice gaya).
Dispatch Clearing aging; window ke baad alert; dispatch bina Final invoice ke block; invoice bina dispatch cancel ya credit note.
2.12
Carton Shortfall at Pickup
Courier ne kam cartons liye, system poora deduct kar de.
Carton count reconcile aur driver sign-off; sirf scanned cartons deduct.
2.13
Credit Counter Drift
Cancel ya edit par credit release nahi hua, customer ka credit zyada used dikhta.
Ledger-derived counter, release triggers, daily recompute.
2.14
Control-Transfer Misconfig
DISPATCH par revenue book hua jabki contract DELIVERY tha.
Per-contract mandatory flag; mode change par Finance approval; period-end check report.
2.15
Quote Price Tampering
Validity ke baad ya quote edit karke purane rate par SO.
Quote versioned aur validity-locked; expired quote se SO block; re-price.
2.16
Short-Pick Cover-Up
Picker chori chhupane ke liye bar-bar short-pick report karta hai.
Har short-pick par priority recount; picker-wise frequency analytic; recount variance approval.
2.17
Abandoned Cart Stock
Cart me maal chhoda, shift badal gayi, maal gum.
Cart sweep, dwell alert, sign-off (6.4).
7. Lifecycle Flow 3: Recurring-to-Revenue (R2R) and Hybrid Subscriptions
Flow: Subscription Tier Defined, Hybrid Checkout (SaaS + Hardware), Recurring Cycle Trigger, Proration Engine, Dunning and Collections.
7.1 Positive Flow (Happy Path)
1. Hybrid Subscription Model (plan definition fixed): Plan: Apex Fleet Tracking System. Components: (a) Monthly Cloud SaaS, standalone Rs 2,500/month; (b) 1 Physical GPS Tracker, standalone Rs 7,000 (goods). Do commercial variants: Variant A: 12-month prepaid bundle Rs 30,000. Variant B: Monthly Rs 2,500 with hardware included on minimum term (hardware recovery via contract asset, 7.2).
2. Cross-Domain Activation: Billing me recurring profile active (Repeat Every 1 Month). Inventory me pehli cycle par GPS tracker ka Fulfillment Order (Flow 2 ki tarah pick, pack, AWB).
3. Monthly Automated Invoicing (Advance Billing): Invoice cycle date se 3 din pehle (D-3) generate hoti hai; pre-debit notice D-2 (kam se kam 24 ghante pehle); charge D-0 (7.4).
4. SSP Allocation (Ind AS 115): Bundle price har performance obligation ko SSP ratio me allocate; hardware point-in-time (dispatch par), SaaS over-time (monthly). Yeh accounting allocation hai, GST value alag (7.2).
5. Deferred Revenue: Customer ne 1 saal ka advance diya to Day 1 par poora amount Deferred Revenue (Contract Liability); GST sirf service portion par advance receipt par.
6. Gateway Auto-Charge: Razorpay/Stripe webhook idempotency key se; capture par Gateway Clearing, bank settlement alag (Section 14.2).
7.2 Worked Example: SSP Allocation aur GST (alag-alag)
SSP (accounting basis, example): GPS Rs 7,000; SaaS 12 months Rs 30,000 (Rs 2,500 x 12). Total SSP Rs 37,000; bundle Rs 30,000. Real SSP observable price ya cost-plus se determine hota hai aur policy me document hota hai.
Accounting allocation (Ind AS 115):
Performance Obligation
SSP (Rs)
Formula
Allocated (Rs)
Recognition
GPS Tracker
7,000
30,000 x 7,000 / 37,000
5,675.68
Point-in-time, dispatch par
SaaS 12 months
30,000
30,000 x 30,000 / 37,000
24,324.32
Over-time, monthly
Total
37,000

30,000.00

SaaS monthly release: pehle 11 mahine Rs 2,027.03, 12th mahine Rs 2,026.99 (rounding adjust; total 24,324.32).
GST value (tax basis, alag): Contract/invoice me line prices commercial hain, jaise Hardware Rs 6,000 aur SaaS 12 months Rs 24,000 (total Rs 30,000, config ke hisaab se). GST inhi invoice values par lagta hai, SSP allocation par nahi. Goods par advance receipt par GST nahi lagta (time of supply invoice ya removal), services par advance milte hi GST [VERIFY-CA]. Bundle composite ya mixed supply hai, yeh CA decide karega; neeche example do alag line items maan kar chalta hai, dono 18%.
Day-1 journal (customer pays Rs 30,000 + GST 5,400 = Rs 35,400):
Account
Debit (Rs)
Credit (Rs)
Bank / Gateway Clearing
35,400

Deferred Revenue (Contract Liability)

30,000
Output GST Payable (advance, SaaS Rs 24,000 x 18%)

4,320
Customer Advance, GST on Goods (held until invoice)

1,080
Hardware dispatch par: Tax Invoice Rs 6,000 + GST Rs 1,080. Dr Deferred Revenue 5,675.68 / Cr Hardware Revenue 5,675.68; Dr Customer Advance GST 1,080 / Cr Output GST Payable 1,080; plus COGS entry Dr COGS / Cr Inventory (cost par).
Har mahine end: Dr Deferred Revenue Rs 2,027.03 / Cr SaaS Revenue Rs 2,027.03 (12th mahine Rs 2,026.99). SaaS ka GST Day 1 par chuka hai, isliye har mahine dubara nahi; monthly tax invoice ya receipt reference issue hota hai.
Variant B (monthly Rs 2,500, hardware pehle dispatch): Dispatch par hardware ka allocated revenue recognize, billing se aage ka hissa Contract Asset. Cancellation rights ka treatment auditor ke saath policy me fix. Early termination par remaining hardware price ka invoice (lock 3.6).
7.3 Proration Rules
Example: Rs 2,500 se Rs 4,000 plan upgrade, 30-day cycle, 12 din bache: Delta = 12/30 x (4,000 - 2,500) = Rs 600. Upgrade par Rs 600 delta invoice. Downgrade par -Rs 600 cash refund nahi, Customer Credit Balance me jaata hai. Cash refund sirf policy ke andar (galat charge) aur hamesha original payment method par.
Edge cases (rules config me):
• First period: Anniversary billing (default): sign-up din se 1 month. Calendar billing: pehla partial period prorated (din / total din), phir 1st se full cycle. Plan par choice.
• Metered usage (storage, API calls, licenses): Arrears me cycle-end par bill; prorate nahi hota; usage events immutable aur idempotent (lock 3.10).
• Coupons: Percentage coupon prorated amount par apply; fixed-amount coupon remaining-days ratio se split ya one-time (coupon definition me); coupon stacking policy (lock 3.11).
• Annual to monthly: Annual plan ka unused portion credit balance me; naya monthly cycle us se adjust; cash refund nahi jab tak policy na ho.
• Add-ons: Plan ke saath hi prorate.
• Tax: GST proration ke baad ki value par; credit balance use par GST dobara nahi.
• Plan-change limit: Per cycle max changes (config); downgrade period-end se effective option.
7.4 Dunning Matrix (RBI-aware, timeline fixed)
Step
Timing
Action
Invoice
D-3
Invoice generate aur customer ko bheji jaati hai
Pre-debit notice
D-2 (kam se kam 24 ghante pehle; config 48h)
Customer ko notification (RBI recurring-payment rules). Rs 15,000 se upar charge par AFA; higher limit categories ke liye verify [VERIFY-CA]
Attempt 1
D-0
Charge; fail par update-card link
Attempt 2
Day 3
Retry; har retry se pehle bhi pre-debit notice rule gateway/bank ke saath verify [VERIFY-CA] (notice D+1)
Attempt 3
Day 7
Retry plus warning
Attempt 4
Day 10
Final retry; fail par Suspended
After suspend
Day 10 se aage
SaaS access limited; hardware recovery workflow (rented); configurable days ke baad Cancelled
Soft-decline ya hard-decline code ke hisaab se retry skip (hard decline par seedha card-update request). Gateway outage flag ho to dunning clock pause (13.6). Off-peak retry window configurable (4 AM sirf default).
7.5 Negative Flow (Loopholes, Fraud and System Locks)
#
Ground Loophole / Fraud Attack
Negative Scenario Kya Hoga?
ERP Standard Business Logic Lock (v3)
3.1
Mid-Cycle Plan Hopping
High tier le kar 2 din baad downgrade aur poora refund maangna.
Exact-day proration; downgrade par sirf delta credit balance; per-cycle change limit; high-tier usage ke baad refund denied.
3.2
Zombie Card Retries
Har minute payment hit, merchant account suspend.
Smart Dunning: strictly Day 0, 3, 7, 10; pre-debit notice aur AFA ke saath; phir Suspended.
3.3
Double Refund / Credit Application
Rs 10,000 credit note Invoice A aur B dono par apply.
Atomic remaining-balance lock: { remainingBalance >= applyAmount }.
3.4
Duplicate Webhook Double Credit
Gateway ek payment ka webhook do baar bhejta hai.
Gateway payment id unique index; replay par 200 OK par koi naya posting nahi.
3.5
Free-Trial Abuse
Alag emails se baar-baar trial.
Eligibility: card fingerprint, GSTIN/PAN, device signals; duplicate par deny.
3.6
Cancel After Hardware Shipped
Hardware lekar pehle mahine cancel.
Minimum term aur early-termination charge; hardware recover ya remaining hardware price ka invoice.
3.7
Refund to Different Instrument
Kisi aur account me refund maangna.
Refund sirf original payment method; exception par Finance approval.
3.8
Advance Receipt GST Miss
Advance mila par GST receipt voucher nahi bana.
Services advance par Receipt Voucher / Advance Tax Invoice auto-generate; GSTR-1 me flow.
3.9
Chargeback After Service
Customer ne bank se payment dispute kar diya jab service use ho chuki.
Chargeback workflow (14.2): evidence pack (usage log, delivery proof); amount disputed receivable me; subscription flag.
3.10
Metered Usage Tampering
Usage events edit ya duplicate ingest.
Usage events append-only, idempotency key; invoice me usage line se source events traceable.
3.11
Coupon Stacking Abuse
Multiple coupons ek sath.
Coupon stacking rules, max redemptions, per-customer limit, expiry.
8. Lifecycle Flow 4: Make-to-Stock (M2S) and Manufacturing / MRP
Flow: BOM Definition, MRP Netting Engine, Work Order Release, Shop Floor Kitting, Final QC and Capitalization.
8.1 Positive Flow (Happy Path)
1. Bill of Materials (BOM): 1 Finished Good (Electric Scooter S1) ke liye 1 Chassis, 2 Wheels, 1 Battery Pack, 2m Wiring Cable (5% scrap factor, effective 2.1m). Multi-level sub-assemblies allowed.
2. MRP Material Netting: Net Requirement = Demand + Safety Stock - ATP (Sellable On-Hand minus unpicked reservations) - Incoming Supply. Example: Demand 10, Safety 1, On-Hand 2, Reservations 0, Incoming 0: 10 + 1 - 2 - 0 = 9 units. Requirement date lead-time offset se nikalti hai; system purchase requisition aur shop-floor plan banata hai.
3. BOM Explosion for 9 units: Chassis 9, Wheels 18, Battery Packs 9, Wiring Cable 9 x 2m x 1.05 = 18.9m.
4. Gate 1: Work Order Released: Status Planned; physical stock aur GL par 0 impact.
5. Gate 2: Material Issue to Shop Floor: Storage bins se WIP_SHOP_FLOOR location (stock ledger double-entry).
6. Gate 3: Assembly and Final QC: Test ride aur electrical diagnostics. Fail units rework (status REWORK) ya SCRAP_BAY (scrap lifecycle 9.4).
7. Finished Good Capitalization: Finished goods rack bin me STORAGE_BINS + AVAILABLE, standard cost roll-up: Dr Finished Goods Inventory / Cr Work-in-Progress.
8.2 Worked Example: Standard Cost Roll-up (illustrative)
Cost element (per scooter)
Rs
1 Chassis
8,000
2 Wheels at 1,500
3,000
1 Battery Pack
15,000
Wiring Cable 2.1m at Rs 50/m
105
Material cost
26,105
Labor and overhead absorbed
2,000
Standard cost per unit
28,105
Standard cost for 9 units
2,52,945
Journals: Gate 2 par Dr WIP (materials) / Cr Raw Material Inventory; labor aur overhead par Dr WIP / Cr Labor and Overhead Absorbed; capitalization par Dr Finished Goods / Cr WIP Rs 2,52,945. Actual aur standard ka fark Production Variance account me; approval threshold se upar variance par Section 9.2 ka approval ladder.
8.3 Negative Flow (Loopholes, Fraud and System Locks)
#
Ground Loophole / Fraud Attack
Negative Scenario Kya Hoga?
ERP Standard Business Logic Lock (v3)
4.1
Phantom Kitting
Shop floor manager ne bina raw material ke WO release kiya, workers baithe rahe.
Hard BOM Availability Gate: kitting tab complete jab storage bins me saare RM ka ATP verify. Missing par 422 Missing Components.
4.2
Production Floor Scrap Cover-up
Worker ne 5 battery packs jala diye aur fake FG entry daali.
BOM Yield Reconciliation: input RM aur output FG ratio match; extra loss SCRAP_BAY me reason code ke saath.
4.3
Partial Kitting Dispute
80% components hain, production shuru ho?
Policy flag per WO: Allow Partial Kit (approved sub-assembly) ya Block. Default Block; partial par Production Head approval aur missing component ki expected date.
4.4
Material Over-Issue
Worker BOM se zyada RM issue karwata hai.
Issue qty BOM plus scrap factor tak; upar Supervisor approval aur reason; excess WIP variance me.
4.5
Serial Traceability Break
Defective battery kis scooter me gayi, pata nahi.
Serial-tracked components FG serial se linked (genealogy); recall par traceable.
4.6
WO Closed with Open WIP
WO close par WIP baaki, cost chhupi.
WO close tabhi jab WIP zero ya variance approved aur posted.
9. Lifecycle Flow 5: Internal Controls, Auditing and Governance
Flow: Move Orders, Transfer Orders (In-Transit), Cycle Counts, Shrinkage Approvals, Scrap Lifecycle, Period Close (Soft and Hard).
9.1 Positive Flow (Happy Path)
1. Move Order (Bin-to-Bin): BIN-A1-01 se BIN-B4-09; total stock unchanged; ledger me from bin, to bin, user, timestamp.
2. Inter-Warehouse Transfer (Hub A to Hub B): Gurugram hub se Bangalore hub 30 units; maal TRANSIT_INTERWH location me; kisi hub se sellable nahi. Tax document rule: Alag GSTIN (alag state ya alag registration) par movement taxable supply hai, isliye Tax Invoice (e-invoice jahan applicable) chahiye; Delivery Challan sirf same-GSTIN movement (e.g., same registration ke do godown) ya non-supply movement (job work, sample, approval) par. E-way bill value threshold se upar dono me [VERIFY-CA]. Bangalore dock par intake aur putaway ke baad Bangalore bins me add.
3. Cycle Counting (Found Excess): Blind count (counter ko system qty dikhti nahi), recount se confirm. 2 extra units, valuation Rs 2,000 (<= Rs 5,000 Tier 0): reason code ke saath auto-approve, bin me add.
4. Shrinkage Approval (Found Shortage): Tier 0 ke andar auto-approve; upar jaate hi approval ladder (9.2) aur ADJ_HOLD (9.3).
5. Period Close: Soft close aur hard close (9.5).
9.2 Tiered Approval Ladder (v3)
Ek jaisa SVP + Finance Director approval chhoti ya medium company me kaam nahi karta. Tiers config hain (values example):
Tier
Adjustment value
Approver
Note
0
Rs 5,000 tak, aur cumulative limits ke andar
Auto-approve with reason code aur recount
Maker approver nahi
1
Rs 5,000 se Rs 50,000
Warehouse ya Operations Manager
Maker se alag user
2
Rs 50,000 se Rs 2,00,000
Head Supply Chain plus Finance Manager
Dono
3
Rs 2,00,000 se upar
Senior VP Supply Chain plus Finance Director
Dono; scrap par photo aur witness
Cumulative controls (Tier 0 gaming ke against):
Control
Rule
Cumulative per user
Ek user ke adjustments ek din me Rs 10,000 aur ek hafte me Rs 25,000 se upar to approval (configurable)
Cumulative per SKU per warehouse
Hafte me limit se upar adjustments par approval aur investigation
Frequency anomaly
Ek user ke 5 ya zyada chhote adjustments ek din me par alert
Maker-checker
Adjustment banane wala kabhi approver nahi
Excess stock
Excess par bhi reason code aur recount; frequent excess par supplier short-billing investigation
Delegate
Approver absent ho to documented delegate (start, end date, limit) approve kar sakta hai; delegation audit-logged
Approval SLA
Tier ke hisaab se SLA; breach par escalation; mobile approval option
9.3 Pending Adjustment = ADJ_HOLD (loophole fix)
Jaise hi koi adjustment Tier 0 se upar banta hai, un units ka status turant ADJ_HOLD ho jaata hai: ATP se bahar, pick ke liye block, move ke liye block. Physical qty tab tak ledger me rehti hai. Approve hone par write-off ya correction post hota hai; reject hone par status AVAILABLE. Isse approval pending me koi chori hua maal bech nahi sakta aur genuine stock bhi galat ATP me nahi dikhta.
Cycle count freeze rule: Count shuru par system qty ka snapshot; count ke dauran in-flight movements (picks, putaways) track hoti hain. Variance = Counted - (Snapshot + Net movements since snapshot). Bin ya zone ko freeze karne ka option (short window); frozen bin par naya pick nahi.
9.4 Scrap Lifecycle (end-to-end)
1. Request: Reason code, photo evidence, witness user; value ke hisaab se approval tier (9.2).
2. Move: Approve hote hi maal SCRAP_BAY location, status DAMAGED. SCRAP_BAY dual-key access hai.
3. Disposition (teen raaste, ek mandatory): (a) Destroy: witness ke saath photo ya video, destruction certificate, hazardous ya e-waste ho to authorised vendor; (b) Sell as Scrap: Finance-approved rate, weighbridge slip, scrap tax invoice (GST), buyer KYC; (c) Return/Claim: vendor warranty ya insurance claim.
4. GL: Write-off par Dr Scrap Loss / Cr Inventory; scrap sale par Dr Bank ya AR / Cr Scrap Sales Income / Cr Output GST; insurance claim par Dr Claim Receivable / Cr Scrap Loss.
5. Controls: SCRAP_BAY aging alert (30 din); periodic count; bin me jo maal bina disposition pada rahe uski report Finance ko.
9.5 Period Close: Soft Close, Hard Close, Audit Adjustment
Stage
Kaun post kar sakta hai
Kab tak
Open
Normal users
Month chalu
Soft Close
Sirf Finance (Accountant with reason aur approval): late vendor bills, cut-off, accruals, GRNI adjustments
Month-end ke baad N working days (default 5); module-wise lock (Inventory pehle, phir AP, AR, GL)
Hard Close
Koi nahi; sirf audit-adjustment period
GST filing aur books freeze ke baad
Audit Adjustment Period
Finance Director, auditor reference ke saath
Statutory audit tak; alag period tag
Reopen
Dual approval, reason, time-box, auditor ko notice (13.5)
Exception
Close checklist: stock ledger vs GL inventory control match, GRNI aging reviewed, Dispatch Clearing aur Sales Clearing zero ya explained, bank reconciliation done, gateway clearing reconciled. Cut-off: 31st ko dispatch scan hua to posting date 31st (soft-close window me). 31st ko GRN hua par bill 2nd ko aaya to GRNI accrual 31st par.
9.6 Negative Flow (Loopholes, Fraud and System Locks)
#
Ground Loophole / Fraud Attack
Negative Scenario Kya Hoga?
ERP Standard Business Logic Lock (v3)
5.1
Internal Theft / Fake Shrinkage
Manager ne Rs 1,50,000 ke do laptop chori karke Damaged/Scrapped dikha diya.
Tier approval (9.2): Rs 1,50,000 Tier 2; Pending Approval; units ADJ_HOLD (not sellable); approve ke bina deduct nahi; photo aur witness zaroori.
5.2
Backdated Accounting Manipulation
Auditor se pehle purani invoice ka rate alter.
Transaction Locking Engine: hard-closed period par 403 Forbidden: Financial Period Closed. Sirf current period ki contra entry.
5.3
Truck Hijack / Transit Loss Fraud
Transfer 30 units, Bangalore par 25 utari.
Transfer Intake Discrepancy Gate: 25 add; baaki 5 TRANSIT_INTERWH me status UNDER_INVESTIGATION; Transit Loss ticket aur insurance claim ledger.
5.4
Threshold Splitting
Rs 1,50,000 ka maal Rs 4,900 ke chhote adjustments me.
Cumulative limits per user, per SKU, per warehouse, frequency alert (9.2).
5.5
Fake Excess Entry
Excess dikha kar baad me alag tarah se nikalna.
Excess par blind recount, reason code, investigation trigger, Finance review.
5.6
Ledger Edit / Delete
User ya DBA ledger edit karta hai.
Immutable ledger: update aur delete API nahi; DB role me delete permission nahi.
5.7
Backdated Stock Movement
Closed period me stock move.
Stock transactions bhi lock date ke andar block.
5.8
Sale of Hold Stock
Approval pending maal ATP me dikhta aur bik jata.
ADJ_HOLD status ATP se excluded (9.3).
5.9
Scrap Diversion
Scrap bay se maal bahar bech diya.
Scrap lifecycle: dual-key bay, mandatory disposition, scrap sale invoice, aging alert (9.4).
5.10
Count Manipulation
Counter system qty dekh kar usi ke hisaab se count likhta hai.
Blind count, recount by different user, variance approval.
5.11
Soft-Close Abuse
Soft-close window me aise entries jo normal period me approve nahi hoti.
Soft-close posting par Finance approval, reason code, report to Finance Director; value cap.
5.12
Transfer Without Tax Document
Alag GSTIN transfer bina tax invoice ya e-way bill.
Transfer dispatch gate par GSTIN comparison; alag GSTIN par tax invoice mandatory; e-way bill validity check.
10. Lifecycle Flow 6: Returns, RTO and RMA Reverse Logistics
Flow: Return Request or Failed Delivery, RMA Approval, Reverse Pickup, Return Dock Intake, QC Triage, Credit Note and COGS Reversal, Refund or Credit.
Dispatch ke baad maal books se nikal chuka hota hai (DISPATCH mode), isliye wapsi par stock aur GL dono ka reverse flow chahiye.
10.1 Positive Flow (Happy Path)
1. RMA Request: System original invoice, serial/batch, return window aur already-returned qty check karta hai (return qty <= sold qty - already returned).
2. RMA Approval: Policy ke andar auto-approve; window ke bahar ya high value par manager approval.
3. Reverse Pickup: Reverse AWB; stock tab tak customer ke paas jab tak dock par scan na ho.
4. Return Dock Intake: Maal RETURN_DOCK par, status RETURN_PENDING_QC (ATP me nahi). Serial/batch original sale se match zaroori.
5. QC Triage: Restock (STORAGE_BINS + AVAILABLE, ATP unlock), Refurbish (rework order, phir restock ya second-grade SKU), Scrap (SCRAP_BAY, reason code, scrap lifecycle 9.4).
6. Credit Note (GST Section 34) aur Accounting: Flow 2 ke 20 units me se 2 return, price Rs 4,000, cost Rs 3,000.
    ◦ Credit Note: Dr Sales Returns Rs 8,000; Dr Output GST Payable Rs 1,440; Cr Accounts Receivable Rs 9,440.
    ◦ COGS reversal (restock units): Dr Inventory Rs 6,000 / Cr COGS Rs 6,000 (original cost par, current cost nahi).
    ◦ Scrap units: Dr Scrap Loss / Cr COGS ya Inventory, reason code ke saath.
7. Refund ya Credit: Credit Balance ya cash refund original payment method par; restocking fee policy se.
GST note: Credit note ki time limit hoti hai (Section 34: financial year ke baad specified date tak) [VERIFY-CA]. Date config me.
10.2 RTO (Return to Origin) Sub-flow
1. Courier delivery fail karta hai; AWB status RTO.
2. Maal warehouse me aata hai aur RETURN_DOCK par RETURN_PENDING_QC me scan; seal intact hai ya nahi record hota hai.
3. Seal intact aur maal sahi: QC ke baad restock; warna scrap ya courier claim.
4. Revenue treatment: E-invoice IRN sirf cancel window (24 ghante) me cancel ho sakta hai; uske baad Credit Note. System RTO par automatically Credit Note draft banata hai (approval ke baad post).
5. DELIVERY-mode contracts me: Revenue abhi post hi nahi hua tha, isliye reversal: Dr Inventory / Cr Goods in Transit to Customer; Dr Dispatch Clearing aur Sales Clearing settle (invoice cancel ya credit note).
6. Forward aur return freight cost shipping expense me; policy ke hisaab se customer ya courier se recover.
7. COD order me RTO par cash collect nahi hua, isliye sirf AR ya revenue reverse hota hai; COD remittance reconciliation Section 14.3.
10.3 Negative Flow (Loopholes, Fraud and System Locks)
#
Ground Loophole / Fraud Attack
Negative Scenario Kya Hoga?
ERP Standard Business Logic Lock
6.1
Return Swap Fraud
Customer asli product rakh kar nakli wapas bhejta hai.
Serial/batch match with original sale; mismatch par QUARANTINE hold, credit note block, investigation ticket.
6.2
Over-Return
Sold se zyada qty return.
Return qty <= sold - returned; atomic counter.
6.3
Return Window Bypass
Window ke baad rep return approve karta hai.
Window ke baad block; override sirf manager approval aur reason ke saath.
6.4
Restock of Damaged Goods
QC inspector damaged return ko sellable bin me daalta hai.
RETURN_PENDING_QC; putaway task tabhi jab QC pass record; QC user aur putaway user alag.
6.5
Double Credit on Same Return
Ek return par do credit notes ya credit note plus cash.
Credit note return receipt se linked; ek receipt par ek credit; remaining balance atomic.
6.6
RTO Ghost Stock
Courier ne RTO bataya par maal pahuncha nahi; stock wapas dikh gaya.
Stock tab hi wapas jab dock par physical scan; AWB status se sirf draft; tab tak RTO_TRANSIT me Return Pending aur courier claim.
6.7
Refund to Different Account
Refund kisi aur instrument par.
Sirf original payment method; exception par Finance approval.
6.8
Backdated Return Credit
Closed period me credit note post.
Transaction lock; credit note current open period me, original invoice reference ke saath.
11. Lifecycle Flow 7: India Statutory Compliance (GST, E-Invoice, E-Way Bill, TDS/TCS, RBI)
Flow: Place of Supply, Tax Determination, E-Invoice IRN, E-Way Bill, Dispatch, GST Returns, ITC Controls, TDS/TCS, Payment Compliance.
11.0 Compliance Config Table (sab values versioned aur effective-dated; sab [VERIFY-CA])
Parameter
Doc ke time ki value
Note
E-invoice applicability threshold
Aggregate turnover Rs 5 crore
Notified threshold badalta hai
E-invoice reporting window
30 din (bade turnover, Rs 10 crore+ par)
IRP reporting time limit
E-invoice cancel window
24 ghante
Uske baad credit note
E-way bill threshold
Consignment Rs 50,000
State-wise rules alag ho sakte hain
MSME payment
Written agreement ho to max 45 din; agreement na ho to 15 din
MSMED Act, Income-tax 43B(h)
Credit note time limit
Section 34: FY ke baad specified date
Config date
ITC claim time limit
Section 16(4): next FY ke 30 November ya annual return, jo pehle
Config date
ITC reversal (Rule 37)
Vendor ko 180 din me payment nahi hua to ITC reverse, payment par re-claim
Aging tracker
RBI recurring payments
Pre-debit notice 24 ghante pehle; AFA Rs 15,000 se upar
Higher limit categories verify
TDS/TCS sections
Vendor category rate-table
Income-tax Act 2025 se naye section numbers
Advance GST
Services par advance par GST; goods par nahi
Mixed ya composite supply CA se confirm
11.1 Positive Flow (Happy Path)
1. Place of Supply aur Tax Split: Supplier state aur place of supply same to CGST + SGST; alag to IGST. Rs 80,000 par 18% = Rs 14,400 (7,200 + 7,200 ya 14,400 IGST).
2. HSN/SAC aur Rate: Item master ke HSN/SAC se rate-table; invoice date par effective rate.
3. E-Invoice (IRN): Applicable business ke B2B invoice par IRP se IRN aur QR milne par invoice Final. Sequence: Pack, Invoice draft, IRN, E-way bill, dispatch. Reporting window ke andar IRP par report (late reporting par block, lock 7.11).
4. E-Way Bill: Consignment Rs 50,000 se upar to movement se pehle; Transfer Orders par bhi. Vehicle badalne par Part-B update.
5. Dispatch Gate Check: AWB manifest tab accept jab IRN aur (applicable) e-way bill valid. Bina inke dispatch block.
6. GST Returns: Sales register se GSTR-1; ITC aur liability se GSTR-3B. GSTR-2B se vendor ITC reconcile; mismatch bill ka ITC hold.
7. ITC Controls: Rule 37 aging (180 din payment tracker), Section 16(4) time-limit alert, ITC Pending (rejected units, 5.1), blocked credit categories item master me flag.
8. TDS/TCS: Vendor payment par TDS rate-table se (category, PAN, threshold). Customer side TCS jahan applicable. Customer dwara kata TDS ke liye 14.4.
9. Reverse Charge (RCM): Notified services ya unregistered vendor par self-invoice, liability aur ITC post.
10. Payment Compliance: MSME 45 ya 15 din tracker (5.1 step 12); recurring card charges par RBI rules (7.4).
11. Rounding: Invoice total round-off alag account me; tax line-level ya invoice-level, ek hi method config me; GSTR-1 aur books ka paise-level mismatch daily recon me dikhta hai.
11.2 Negative Flow (Loopholes, Fraud and System Locks)
#
Ground Loophole / Fraud Attack
Negative Scenario Kya Hoga?
ERP Standard Business Logic Lock
7.1
Dispatch Without E-Way Bill
Bina e-way bill maal bheja.
Dispatch gate par validity check; missing par manifest block.
7.2
Invoice Without IRN
E-invoice applicable par bina IRN invoice bheji.
Invoice status Final tabhi jab IRN mile; warna Draft aur customer email block.
7.3
Wrong Tax Split
Interstate sale par CGST+SGST.
Place of supply se tax type auto; manual override par Finance approval.
7.4
ITC on Ineligible or Unmatched Bill
Vendor ne GSTR-1 nahi diya par ITC claim hua.
GSTR-2B match ke bina ITC claimable nahi; mismatch par hold.
7.5
Wrong TDS Section / Rate
Section hardcode se galat katauti.
Vendor category rate-table; PAN missing par higher rate; effective-date versioning.
7.6
Late Credit Note Past Limit
Statutory date ke baad credit note.
Time-limit warning; limit ke baad Finance review.
7.7
E-Invoice Cancellation After Window
Window ke baad IRN cancel.
Cancel disable; sirf Credit Note.
7.8
Tax Rate Change Mid-Period
Rate badalne ke baad purani rate.
Effective-dated rate-table; invoice date par sahi rate; backdating lock par block.
7.9
Rule 37 ITC Miss
Vendor ko 180 din me payment nahi, ITC reverse nahi hua.
Aging tracker; 150 din par alert; 180 din par reversal task aur payment par re-claim.
7.10
ITC Time-Barred
Section 16(4) deadline ke baad ITC claim.
Deadline alert; deadline ke baad ITC claim block, Finance review.
7.11
Late E-Invoice Reporting
IRP reporting window ke baad invoice report.
Window se pehle alert; window ke baad invoice report block aur Finance review.
7.12
MSME Late Payment (43B(h))
Payment due date ke baad.
Tracker aur year-end report (lock 1.15).
7.13
Rounding Mismatch
GSTR-1 value aur books me paise ka fark.
Single rounding method; daily recon; mismatch alert.
12. Lifecycle Flow 8: Partial Shipment, Backorder, Landed Cost, Valuation and Multi-Currency
Flow: Partial Fulfillment, Backorder Queue, Landed Cost Allocation, Inventory Valuation (FIFO/WAC), Forex Booking and Revaluation.
12.1 Partial Shipment and Backorder
1. Sales Order 100 units; ATP sirf 60. Customer setting Allow Partial hai to 60 units reserve, pick, dispatch hoti hain; Ship Complete hai to poora SO hold rehta hai.
2. Ship Complete visibility: Hold dashboard me SO ka reason (Stock short), Expected Availability Date (Future ATP) aur owner dikhta hai. SO N din (config) se zyada Ship Complete hold me ho to rep aur customer ko alert, aur customer se Partial Approval maangne ka one-click option (customer consent record hota hai).
3. Invoice sirf dispatch-ready 60 units par (e-invoice aur e-way bill bhi 60 par). Second shipment par alag invoice.
4. Baaki 40 units Backorder queue me. Backorder stock reserve nahi karta; naya stock putaway hote hi queue FIFO (ya fixed priority rule) se reservation me jaata hai.
5. Backorder ki expiry date hai; customer cancel kar sakta hai aur credit exposure release hota hai.
6. Dono shipments ek hi SO se linked rehti hain: fulfillment percentage aur revenue schedule trace.
12.2 Landed Cost Allocation
Inventory cost me sirf maal ka price nahi, freight, insurance, customs aur handling bhi judte hain. Example (Flow 1 ke 95 accepted units): freight Rs 4,750 quantity basis par allocate.
Landed unit cost = (2,66,000 + 4,750) / 95 = Rs 2,850
Allocation basis (quantity, value, weight) item category par configurable aur locked. Landed cost bill maal bikne ke baad aaye to bachi qty par capitalize hota hai aur bik chuki qty ka hissa Cost Variance (COGS adjustment) me.
12.3 Inventory Valuation (FIFO aur Weighted Average Cost)
Example: 100 units on hand Rs 2,850 par; 50 units naye Rs 3,000 par aaye.
WAC = (100 x 2,850 + 50 x 3,000) / 150 = Rs 2,900
FIFO me pehle 100 units Rs 2,850 par issue hongi, phir Rs 3,000 par. Method company ya item category level par ek baar set; change sirf financial year ke start par, approval, opening valuation restate aur disclosure ke saath; mid-year change block.
12.4 Multi-Currency aur Forex (Export Sales)
Example (illustrative rates): export invoice USD 1,000; invoice date rate Rs 83, payment date rate Rs 84.
Event
Rate (Rs/USD)
Entry
Invoice booking
83
Dr AR Rs 83,000; Cr Export Sales Rs 83,000 (zero-rated, LUT ke saath ya IGST pay-and-refund)
Month-end revaluation (agar open)
Closing rate
Unrealized forex gain ya loss; next period start par reverse
Payment receipt
84
Dr Bank Rs 84,000; Cr AR Rs 83,000; Cr Realized Forex Gain Rs 1,000
Exchange rates authorized rate table (source aur date ke saath) se; manual override par approval. Import payables ka forex Section 5.5.
12.5 Negative Flow (Loopholes, Fraud and System Locks)
#
Ground Loophole / Fraud Attack
Negative Scenario Kya Hoga?
ERP Standard Business Logic Lock
8.1
Partial Shipment Billing Mismatch
60 units gayi par 100 ka invoice bana.
Invoice qty <= dispatch-ready qty; SO line par invoiced aur shipped counters.
8.2
Backorder Queue Jumping
Rep favourite customer ko aage karta hai.
Fixed priority rule; manual change par approval aur audit log.
8.3
Landed Cost Manipulation
Allocation ghata-badha kar margin ya inventory value badhana.
Allocation basis locked; change par Finance approval aur revaluation entry.
8.4
Mid-Year Valuation Method Change
Profit badhane ke liye FIFO se WAC ya ulta.
Year-start par hi; dual approval aur disclosure.
8.5
Forex Rate Manipulation
Manual rate daal kar gain ya loss banana.
Authorized rate table; override par approval aur variance alert.
8.6
Late Landed Cost on Sold Stock
Cost bill aane tak maal bik chuka.
Cost Variance posting (bacha stock par capitalize, bika hua COGS me).
8.7
Negative Stock Valuation
Negative stock se valuation galat.
Sellable negative stock allowed nahi (2.1); controlled exceptions Section 15.4; valuation sirf positive layers par.
8.8
Ship Complete Order Stuck
Order bina visibility ke mahino hold, customer naraaz.
Hold dashboard, aging alert, Partial Approval option (12.1).
13. Lifecycle Flow 9: Platform Controls (SoD, RBAC, Idempotency, Transactions, Failure Recovery)
Flow: Role Assignment, Maker-Checker, Atomic Posting, Idempotent Events, Immutable Audit Trail, Failure and Recovery, Collusion Analytics.
13.1 Segregation of Duties (SoD) Matrix
Neeche ke jode ek hi user ko kabhi nahi mil sakte (role assignment par block aur runtime par document-level check).
Action A
Action B (same user ke liye blocked)
Risk
PO create
GRN post
Ghost receipt aur fake vendor
GRN post
Vendor bill payment approve
Over-delivery collusion
Vendor master create ya bank change
Vendor payment approve
Fake vendor, payment redirect
Stock adjustment create
Stock adjustment approve
Fake shrinkage write-off
QC inspect
Putaway confirm
Damaged stock restock
SO create
Credit limit release
Credit breach for commission
Credit note create
Credit note approve
Fake credit note
Journal entry post
Journal entry approve
Books manipulation
Price list edit
SO create
Discount abuse
Period lock open
Journal post in that period
Backdating
Scrap approve
Scrap bay access (disposition)
Scrap diversion
Lite profile (small team) fallback: Jahan headcount ki wajah se same user ko do role karne padte hain, wahan compensating controls: sirf low-value par (config limit), har aisa transaction Dual-Role Flag ke saath next-day manager review queue me, aur flagged items ka monthly report Finance ko. Paisa nikalne wale jode (vendor bank change plus payment approve, journal post plus approve) Lite me bhi kabhi allowed nahi.
13.2 RBAC aur Approval Hierarchy
• Roles least-privilege: Storekeeper, Dock Supervisor, QC Inspector, Picker, Packer, Sales Rep, Sales Manager, Procurement Manager, Accountant, Finance Manager, Finance Director, Operations Manager, Head Supply Chain, Senior VP Supply Chain, Auditor (read-only).
• Har sensitive action ka alag permission (create, approve, post, reverse, unlock).
• Approval chain tiered hai (Section 9.2); Tier 3 me Senior VP aur Finance Director dono. Approver absent ho to documented delegate (written delegation, start aur end date, limit); delegation audit-logged; approver apni hi cheez approve nahi kar sakta.
• Named logins mandatory: shared login nahi; scanner par PIN ya biometric; shift roster role-mapping.
• Admin aur DBA ko bhi ledger delete ki permission nahi. Quarterly access review auditor ko.
13.3 Atomic Transactions aur Scale (Mongo ke asli risks ke saath)
• Ek business event ke saare documents (stock movement, ledger entries, GL journal, reservation, credit counter) ek transaction me. MongoDB me multi-document transactions ke liye replica set ya sharded cluster zaroori hai.
• Hot SKU contention fix: Balance ko ek document me baar-baar update karne ke bajay ledger-style design: append-only stock movements plus derived balance (periodic snapshot). Allocation ke liye per-SKU serialized queue (ek SKU ki requests ek ke baad ek), taaki bahut concurrency par WriteConflict aur retry storm na ho. Single-document guard ({ stock: { $gte: qty } }) bhi rakha jaata hai par akela kaafi nahi.
• Transaction size aur lifetime: Transaction chhote rakho (default lifetime limit dhyan me). Bade multi-line orders saga me: line-wise reservation steps, fail par compensating release; poora order tab tak Pending jab tak saari lines reserve na ho.
• Debit = Credit enforcement: Sirf central Posting Service GL collections me likh sakti hai (DB role); har posting batch header me total debit, total credit; app check plus DB schema validation; daily independent job trial balance recompute karta hai. Chaaho to GL ke liye relational (ACID) database use karo; Mongo ho to upar ke controls compulsory.
• Crash ya timeout par poora rollback; partial posting kabhi persist nahi hoti.
13.4 Idempotency
• Har webhook (Razorpay, Stripe, courier) aur har write API par idempotency key; same key dobara aaye to pehla result lauta diya jaata hai. Offline scanner events par device-generated key.
• Payment id, AWB number, e-way bill number, vendor invoice number, BoE number par unique indexes.
• Outbox pattern: posting aur event ek hi transaction me; downstream retry aur dead-letter queue se consume.
13.5 Immutable Audit Trail
• Stock ledger aur GL append-only; galti par reversal plus nayi correct entry.
• Har entry me user, role, timestamp, source document, reason code, before/after, approval reference.
• Tamper-evidence: Hash chain per entity ya per warehouse, per day (global single chain nahi, warna serialization bottleneck); din ka root hash write-once storage me anchor hota hai. Retention statutory period tak.
• Period unlock exceptional event: dual approval, reason, time-box, auditor notification.
13.6 Failure aur Recovery
Failure
Kya hota hai
Controlled recovery
Courier API down
Dispatch manifest confirm nahi, stock deduct nahi
Maal OUTBOUND_BAY me hold; retry queue. Time-box ke baad Manual Override: Warehouse Manager request, Finance approve, gate-pass photo aur driver details; stock deduct aur COGS tentative flag; API wapas aane par post-facto reconciliation.
IRP (e-invoice) down
IRN nahi mil sakta
Invoice Draft; retry; statutory fallback jo CA define kare; dispatch hold ya approved exception.
E-way bill portal down
Bill generate nahi
Retry; approved fallback process CA ke hisaab se; dispatch hold.
Payment gateway down
Auto-charge fail
Dunning clock pause (outage flag); fail customer failure nahi ginte.
DB crash mid-transaction
Partial write ka darr
Atomic rollback; idempotency key se client retry safe.
DB primary failover
Short write-unavailability
Retryable writes, idempotency; scanner offline queue (15.3).
Scanner offline
Scan upload nahi
Offline queue aur sync-conflict rules (15.3).
Webhook replay ya out-of-order
Double ya galat state
Idempotency plus state-machine guard.
Outbox backlog
Downstream late
Dead-letter queue, backlog alert, replay tool.
Approver unavailable
Approval stuck
Delegate (13.2); escalation timer; mobile approval.
Wrong posting discovered
Galat GL ya stock entry
Reversal plus correct entry, kabhi edit nahi.
13.7 Negative Flow (Loopholes, Fraud and System Locks)
#
Ground Loophole / Fraud Attack
Negative Scenario Kya Hoga?
ERP Standard Business Logic Lock
9.1
Role Stacking
Admin user ko incompatible roles deta hai.
SoD matrix role assignment par block; exception par CFO approval aur compensating control.
9.2
Self-Approval via Delegation
User khud ko delegate bana kar approve karta hai.
Delegate banane wala aur approve karne wala same document par same person nahi; delegation audit-logged.
9.3
Direct DB Edit
DBA stock ya GL value seedha badalta hai.
Application-level immutable ledger; DB users ko update/delete nahi; hash-chain mismatch alert.
9.4
Webhook Replay Attack
Purana payment webhook dobara.
Signature verification, timestamp window, idempotency key.
9.5
Manual Override Abuse
Courier API down ka bahana bana kar stock bina handover nikaala.
Outage evidence (API health log), dual approval, photo aur driver details, post-facto reconciliation; frequent override par alert.
9.6
Partial Posting After Crash
Stock kat gaya par GL post nahi.
Ek transaction me dono; crash par rollback; daily stock ledger vs GL reconciliation job.
9.7
Period Unlock Abuse
Closed period bina record ke khol kar edit.
Dual approval, reason, time-box, audit log, auditor notification.
9.8
Collusion
Do log milkar SoD bypass karte hain.
Collusion analytics (13.8).
9.9
Shared Login
Ek login do log use karte hain; SoD bekar.
Named logins, scanner PIN ya biometric, concurrent-session alert.
13.8 Collusion Analytics aur Rotation
SoD ek banda rokta hai, do log milkar karein to nahi. Isliye:
• Vendor master vs employee master match: bank account, phone, address, PAN.
• Same maker-approver pair ka bahut zyada repeat (e.g., ek approver hamesha ek hi maker ka adjustment approve kare) par alert.
• Round-number adjustments, after-hours postings, weekend postings, aur ek picker ke bar-bar short-picks par pattern alert.
• Sensitive roles ki job rotation aur mandatory leave rule (godown aur payments).
• Whistleblower channel aur quarterly Finance review report.
14. Lifecycle Flow 10 (New): Finance Operations (Gateway, COD, TDS Receivable, Bad Debt, Bank, Fixed Assets, Inter-Company, Year-End)
Flow: Gateway Settlement, COD Remittance, Customer TDS, Bad Debt, Vendor Advance, Bank Reconciliation, Fixed Assets, Inter-Company, Year-End Closing.
Yeh flow v2 me sirf feature matrix me tha. Accounts team ka roz ka kaam yahin se chalta hai, isliye ab flow aur locks ke saath.
14.1 Daily Reconciliation Spine
Har din ye cheezein match honi chahiye: Stock ledger vs GL Inventory control, Gateway Clearing vs settlements, Dispatch Clearing aur Sales Clearing, COD Receivable vs courier remittance, Credit counter vs ledger, Trial balance. Mismatch par ticket aur owner.
14.2 Payment Gateway Settlement, Fees, Chargebacks
1. Capture: Webhook se Dr Gateway Clearing / Cr AR (ya Deferred Revenue); idempotent.
2. Settlement (T+n, net of fees): Example: capture Rs 35,400; gateway fee 2% = Rs 708; GST on fee 18% = Rs 127.44. Entry: Dr Bank Rs 34,564.56; Dr Gateway Fee Expense Rs 708; Dr Input GST on Fee Rs 127.44; Cr Gateway Clearing Rs 35,400. Gateway par applicable TDS/TCS ho to config se alag line [VERIFY-CA].
3. Reconciliation: Settlement report ko payment id aur settlement id se match; unmatched ya short-settled items queue me; settlement delay aging (3 din se upar alert).
4. Refund: Gateway refund Dr AR ya Sales Return / Cr Gateway Clearing; refund settlement alag reconcile; sirf original method (lock 3.7).
5. Chargeback: Bank dispute aane par Dr Disputed Receivable (Chargeback) / Cr Gateway Clearing, plus chargeback fee. Response deadline tracker aur evidence pack (invoice, delivery proof, usage log). Jeeta to reverse; haara to Dr Bad Debt ya Sales Return / Cr Disputed Receivable.
14.3 COD (Cash on Delivery) Reconciliation
1. Dispatch par AWB me COD amount. Courier ne deliver karke cash collect kiya (courier status Delivered).
2. Entry: Dr COD Receivable (Courier) / Cr Accounts Receivable (Customer). Customer invoice settle.
3. Remittance (weekly ya cycle-wise): Courier ek remittance file deta hai (AWB-wise). Example: 10 AWB, COD Rs 40,000; courier fee Rs 800 + GST Rs 144 = Rs 944. Dr Bank Rs 39,056; Dr Courier Fee Expense Rs 800; Dr Input GST Rs 144; Cr COD Receivable (Courier) Rs 40,000.
4. Short remittance ya dispute: AWB-wise match; kam paisa aane par dispute ticket, N din (default 7) me courier ko claim; us tak courier payable hold ya set-off policy.
5. RTO par COD: Cash collect nahi hua; sirf AR ya revenue reverse (10.2).
14.4 Customer TDS (Form 26AS / AIS Reconciliation)
Customer payment me TDS kaatkar deta hai. Example: invoice Rs 1,00,000 + GST Rs 18,000 = Rs 1,18,000; TDS 2% on Rs 1,00,000 = Rs 2,000 (rate customer ke category par [VERIFY-CA]). Receipt: Dr Bank Rs 1,16,000; Dr TDS Receivable Rs 2,000; Cr Accounts Receivable Rs 1,18,000. Invoice poora allocate hota hai. Quarterly 26AS/AIS se TDS Receivable match; certificate (Form 16A) tracking; unmatched TDS par customer follow-up; TDS Receivable aging; income-tax return me credit claim.
14.5 Bad Debt aur Provision
• Aging-based expected credit loss provision (matrix config me: 0-30, 31-90, 91-180, 180+ din) [VERIFY-CA], monthly journal Dr Bad Debt Expense / Cr Provision.
• Write-off: tiered approval (9.2 ke tarz par value-based), Finance Director ke bina nahi; maker-checker; customer ko Credit Block; legal ya collection action reference.
• Recovery baad me aaye to alag income entry; purana write-off reverse nahi hota (sirf recovery post).
• GST aspect (bad debt par tax adjustment sirf law ke hisaab se credit note ke through) [VERIFY-CA].
14.6 Vendor Advance
Advance sirf PO ke against; Dr Vendor Advance / Cr Bank; TDS advance par applicable ho to rate-table se; bill aane par Dr AP / Cr Vendor Advance adjust. Unadjusted advance ki aging (60 din) Finance review.
14.7 Bank Reconciliation aur Banking Rules
• Statement CSV ya feed import; auto-match rules: UTR, payment id, amount plus date window, vendor ya customer reference.
• Unmatched items queue aging; banking rules se bank charges, interest, GST on charges auto categorize.
• Accounts: Current, savings, petty cash (imprest), escrow; har account ki reconciliation soft-close checklist me mandatory.
14.8 Fixed Assets
1. Capitalization: Vendor bill ya expense par Asset flag; asset register entry (tag, location, custodian, cost, date). CWIP se capitalization.
2. Depreciation: Schedule (Companies Act aur Income-tax, dono basis alag) [VERIFY-CA]; monthly Dr Depreciation Expense / Cr Accumulated Depreciation.
3. Disposal: Approval, sale invoice (GST), gain ya loss: Dr Bank/AR, Dr Accumulated Depreciation / Cr Asset Cost, Cr or Dr Gain/Loss on Disposal.
4. Physical verification: Yearly tag audit; missing asset par investigation.
5. ITC on capital goods: Eligibility item flag se.
14.9 Inter-Company Accounting
Cross-entity transfer ya sale ek hi transaction me dono entities me mirror posting: Entity A Dr Due From B / Cr Sales (ya Inventory); Entity B Dr Inventory / Cr Due To A. GST invoice alag GSTIN par (9.1). Month-end Due From / Due To ka matching report aur consolidation elimination; mismatch par ticket. Transfer pricing policy config me.
14.10 Year-End Closing
• Pre-close checklist: sab bank recs, GRNI review, stock count, provision, fixed asset depreciation, forex revaluation, inter-company match, open credit notes.
• Closing entry: P&L accounts retained earnings me close (system generated, reversible sirf audit period me).
• Opening balances auto-carry; valuation method change sirf isi window me (12.3).
• Audit adjustment period: Section 9.5.
14.11 Negative Flow (Loopholes, Fraud and System Locks)
#
Ground Loophole / Fraud Attack
Negative Scenario Kya Hoga?
ERP Standard Business Logic Lock
10.1
Settlement Mismatch
Gateway ne captured se kam settle kiya, kisi ne dekha nahi.
Daily payment-id aur settlement-id match; unmatched aging alert; Finance owner.
10.2
Chargeback Ignored
Dispute response deadline nikal gayi, paisa gaya.
Deadline tracker, evidence checklist, escalation.
10.3
COD Short Remittance
Courier ne kam paisa diya.
AWB-wise reconcile; 7-din dispute window; payable set-off.
10.4
TDS Credit Lost
Customer ne TDS kata par 26AS me nahi aaya.
TDS Receivable aging; quarterly 26AS match; follow-up; write-off approval.
10.5
Bad Debt Write-off Abuse
Collectible receivable chupke write-off.
Tiered approval, maker-checker, customer block, recovery tracking.
10.6
Asset Disposal Fraud
Asset bina approval ya invoice ke nikala.
Disposal approval; sale invoice; asset tag audit; gate-pass match.
10.7
Inter-Company Mismatch
Ek entity me entry, doosri me nahi.
Mirror posting ek transaction me; elimination mismatch report.
10.8
Year-End Close With Open Items
Bina bank rec ya count ke close.
Pre-close checklist hard-gate.
10.9
Bank Rec Skipped
Month-end bina reconciliation.
Soft-close checklist me mandatory; incomplete par close block.
15. Lifecycle Flow 11 (New): Ground, Sales and Accounts Operating Rules
Flow: Scan Policy, Offline Operation, Controlled Exceptions, Small-Team Mode, Dwell Alerts, Daily Operating Calendar, Go-Live Readiness.
Yeh section v2 ki sabse badi kami pakadta hai: locks the, par jab kaam ruk jaaye tab kya karein yeh nahi tha. Yahan saare exception paths hain taaki log system ke bahar jugaad na karein.
15.1 Design Rule
Har mandatory gate (jahan paisa, tax ya control transfer hota hai) ke liye ek controlled exception path hona zaroori hai: koi bhi worker ya rep ko kabhi 'system ruk gaya, ab kya karein' wali sthiti me nahi chhodna. Exception path me hamesha: reason code, approver, time-box aur auto-follow-up task.
15.2 Scan Points: Mandatory vs Risk-Based
Scan point
Status
Kyun
Dock count aur GRN
Mandatory
Stock aur liability ki shuruaat
QC result
Mandatory
Damaged stock ko sellable hone se rokna
Putaway bin scan
Mandatory
ATP unlock yahin se
Pick: bin plus SKU (batch, serial)
Mandatory
Galat item, FEFO
Pack verify (SKU, qty, weight)
Mandatory
Wrong dispatch
AWB manifest at dispatch
Mandatory
Control transfer, COGS
PICK_CART scan
Risk-based
Single-line orders me pick aur pack ek scan me merge ho sakte hain
PACKING_TABLE alag scan
Risk-based
Pack verify me hi cover
OUTBOUND_BAY scan
Risk-based
AWB manifest cover karta hai
Peak (Diwali) mode: Operations Head time-boxed Lean Mode on karta hai (risk-based scans merge, carton-level batch scan). Mandatory gates kabhi skip nahi; mode on-off audit-logged; peak ke baad daily variance review.
15.3 Offline Mode (Warehouse Wi-Fi dead zones)
• Scanner app local cache rakhta hai (bin, SKU, batch, open pick lists). Offline me allowed: putaway, pick (existing reservation ke against), move, count. Not allowed offline: dispatch manifest (carrier API chahiye), adjustment approval, naya reservation, credit release.
• Har offline event device idempotency key aur sequence number ke saath queue hota hai.
• Sync conflict rules: Event server par aane par validate hota hai; conflict (bin pehle khali ho chuka, reservation expire) hone par silent overwrite nahi; supervisor Conflict Queue me resolve karta hai; ledger me koi galat entry nahi jaati.
• Max offline duration (default 4 ghante); uske baad us device ke naye scans supervisor approval par. Wi-Fi dead-zone map aur reconnect alert.
15.4 Provisional Receipt aur Controlled Exceptions (negative-stock window)
Sellable ATP kabhi negative nahi hota. Phir bhi ground par maal pehle aa jaata hai aur paper baad me, isliye ye exceptions:
Situation
Controlled path
Maal aaya, PO ya GRN late
Provisional Receipt: stock QC_HOLD status, valued Rs 0, ATP me nahi; 24 ghante me PO match (GRN) ya Rejected at Gate; aging alert
Return maal aaya, RMA entry nahi
Unmatched Return Queue: RETURN_DOCK me hold, 48 ghante me RMA link ya reject
System me qty 0 par physical mila
Found Stock flow: excess adjustment (reason code, blind recount, tiered approval); ADJ_HOLD jab tak approve
Consumables (fasteners, labels) ka production consumption system se zyada
Negative-stock exception window: sirf non-batch, non-serial, low-value category; auto-backflush; limit aur 24 ghante time-box; Dock supervisor approval; Finance ko Negative Stock Exception Report
Batch ya serial item ka kam stock
Exception nahi; hard block (traceability ke liye)
15.5 Small-Team aur Night-Shift Mode (SoD fallback)
• Named logins hamesha; shared login nahi.
• Single-Operator Shift: Jab ek hi banda present ho, system low-value transactions (cap config) ek user ko multi-role me allow karta hai, photo evidence ke saath, aur har aisa transaction Dual-Role Flag ke saath subah manager review queue me.
• On-call approver ko mobile approval; SLA aur escalation.
• Paisa nikalne wale ya statutory steps (vendor bank change, payment approve, IRN, period unlock) single-operator mode me kabhi allowed nahi.
15.6 Dwell-Time Alerts (config)
Zone ya state
Default alert
INBOUND_DOCK, QC_HOLD
24 ghante
PICK_CART
Shift end
PACKING_TABLE
12 ghante
OUTBOUND_BAY
24 ghante
RETURN_DOCK, RETURN_PENDING_QC
48 ghante
TRANSIT_INTERWH
Expected delivery + 24 ghante
CUSTOMER_TRANSIT
N din (courier SLA)
SCRAP_BAY
30 din
Dispatch Clearing (invoiced, not dispatched)
24 ghante
GRNI
30 din
Reservation unshipped
7 din reminder, 15 din release
15.7 Ground Exceptions Table
Situation
Controlled path
Barcode damaged ya unreadable
Label reprint request; ya manual entry with reason plus supervisor PIN; frequency alert (11.5)
Vendor barcode nahi
Dock par internal label print aur stick; item master me vendor barcode map
UoM mismatch (box vs pcs)
Item UoM table ke conversion se auto; receipt par UoM mandatory aur preview
Batch ya expiry capture
GS1 barcode scan ya double-entry; do entry me mismatch par block
Serial items bulk
Carton barcode plus serial range, ya file upload with validation; duplicate serial par reject
Mixed-batch carton
Carton split task; alag batch me receive
Damaged during pick
Pick screen se Damaged report, item DAMAGED status, replacement pick, adjustment (9.2)
Item master me nahi
Temporary Item Request (24 ghante me Master Data team); tab tak QC_HOLD
Cycle count ke dauran movement
Snapshot plus net movement (9.3)
Printer ya power failure
Offline mode (15.3), label backlog queue
15.8 Daily Operating Calendar (Accounts aur Sales)
Frequency
Kaam
Daily
Stock ledger vs GL recon; gateway settlement match; COD remittance; Dispatch Clearing aur Sales Clearing check; credit counter recompute; credit hold queue SLA; hold dashboard review (Sales)
Weekly
GRNI aging; MSME aging; bank reconciliation; TDS Receivable aging; reservation aging; backorder queue
Month-end
Soft-close checklist (9.5); GSTR-1, GSTR-3B, GSTR-2B recon; ITC Pending review; Rule 37 aging; depreciation; ECL provision; forex revaluation; inter-company match
Quarterly
Access review; 26AS match; SoD exceptions review; collusion analytics report; asset verification (rolling)
Yearly
Year-end close (14.10); valuation method review (year-start only); tax config update review
15.9 Go-Live Readiness Checklist (day 1 se pehle ye sab tick)
1. Control Profile choose (Lite, Standard, Strict) aur approval tiers set.
2. Tax config (GST rates, HSN/SAC, TDS rate-table, e-invoice aur e-way thresholds, MSME) CA sign-off ke saath.
3. Har customer ya contract par Control Transfer flag (DISPATCH ya DELIVERY) auditor-approved policy ke hisaab se.
4. Locations, bins, barcodes, item UoM table, batch/serial flags, shelf-life rules.
5. Roles, named logins, SoD matrix, delegation, on-call approvers.
6. Opening balances (stock, AR, AP, bank, fixed assets), cut-off date, period calendar.
7. Carrier, gateway, IRP, e-way bill integrations tested; fallback process documented.
8. Scanner devices, offline test, Wi-Fi dead-zone map.
9. Reconciliation owners (daily calendar 15.8) assigned.
10. UAT: Section 18 ke saare positive aur negative tests pass; tabhi go-live.
15.10 Operating Locks (Flow 11)
#
Ground Loophole / Fraud Attack
Negative Scenario Kya Hoga?
ERP Standard Business Logic Lock
11.1
Peak Mode Abuse
Lean Mode me mandatory scan bhi skip.
Lean Mode sirf risk-based scans par; mandatory gates hardcoded; mode audit-logged aur time-boxed.
11.2
Offline Sync Overwrite
Offline events sync par server data overwrite karte hain.
Conflict Queue, no silent overwrite, max offline duration.
11.3
Negative-Stock Exception Abuse
Exception window ka istemal chori chhupane ke liye.
Sirf low-value non-batch non-serial; limit, time-box, approval, Finance report.
11.4
Single-Operator Abuse
Night shift me akela banda high-value adjust kare.
Value cap, photo evidence, statutory steps blocked, next-day review.
11.5
Barcode Manual Entry Abuse
Manual entry se galat item ya qty.
Reason plus supervisor PIN, frequency alert, mismatch par block.
11.6
Count In-Flight Error
Count ke dauran pick hui, variance galat.
Snapshot plus net movements; freeze option.
11.7
Provisional Receipt Aging
Provisional maal mahino tak bina GRN.
24 ghante me convert ya Rejected at Gate; aging alert.
11.8
Unmatched Return Parked Forever
Return dock par pada rahe, credit nahi.
48 ghante me RMA link ya reject; aging alert.
16. Master Operations Summary
Operational Milestone
Positive Expected Result
Negative Prevention Mechanism
Exception Path (kaam ruke nahi)
PO Inward at Gate
3-Way match, GRN, GRNI accrual
Over-delivery cap (+5%), price variance tolerance, AQL
Provisional Receipt (24h); Short Close approval
Putaway to Rack Bin
ATP unlocks only upon bin scan
Zero ATP at dock and QC
Scanner offline queue
Sales Order Booking
Reservation plus credit reservation; Future ATP promise
Atomic reservation; reservation expiry; credit race lock
Credit hold SLA and emergency window
Pack to Invoice
Invoice, IRN, e-way bill before dispatch
Invoice Final only with IRN; Dispatch Clearing aging
IRP down: draft and approved fallback
Courier Handover
COGS and Revenue posted at control transfer
Courier token, carton count, mandatory IRN and e-way bill
Controlled manual override
Recurring Subscriptions
Monthly invoice D-3, notice D-2, charge D-0; SSP allocation
Exponential dunning, pre-debit rules, coupon and trial locks
Gateway outage pause
Credit Adjustments
Credit balance applied
Atomic remaining balance
Finance approval for exceptions
Returns and RTO
Return QC, credit note, COGS reversal
Serial match, over-return counter, restock only after QC
Unmatched Return Queue (48h)
Stock Discrepancy
Cycle count reconciles bin
Tiered approval, cumulative limits, ADJ_HOLD
Found Stock flow; single-operator mode
Manufacturing
Standard cost roll-up, FG capitalization
BOM gate, yield reconciliation, over-issue control
Partial kit with approval
Valuation and Cost
Landed cost in inventory, one method
Method change only at year start
Cost Variance posting
Finance Operations
Gateway, COD, TDS, bank reconciled daily
Settlement match, chargeback tracker, bad debt approvals
Dispute queues with SLA
Platform Integrity
Atomic, idempotent, auditable posting
SoD, immutable ledger, per-entity hash chain
Delegation, mobile approval, Lite profile
Financial Auditing
Real-time Trial Balance
Soft and hard close, module-wise lock
Audit adjustment period
17. All-Domains Exhaustive Feature Verification Matrix
Yeh checklist teeno domains ke har feature ko cover karti hai: original 97 features, v2 ke 18 controls aur v3 ke 24 naye controls (total 139). Tick ka rule: box tabhi tick hoga jab (1) feature implemented ho, (2) kam se kam ek positive test (P-series) pass ho, aur (3) us feature ke saare linked negative locks (T-series) pass hon. Sirf design me mention hona tick nahi hai. Unticked matlab Designed, par Implemented ya Tested nahi. Ek document ka owner domain Section 3.5 me hai; matrix me jo feature teen domains me dikhta hai wahan implementation ek hi owner ke paas hai.
17.1 Books Domain (35 Features)
• ☐ Items and Products Master: Goods vs Services, Sales/Purchase rates, HSN/SAC, Tax rates
• ☐ Inventory Adjustments: Quantity and value reconciliation, cost center allocations
• ☐ Customers Master: Billing/shipping addresses, GSTIN/PAN, credit limits, payment terms
• ☐ Commercial Quotes: Itemized pricing, discounts, custom validity, client acceptance
• ☐ Sales Orders: SO confirmation, backorder flags, customer PO reference
• ☐ Tax Invoices: GST tax invoices (CGST/SGST/IGST), TDS withholding, round-off, due dates
• ☐ Recurring Invoices: Contract schedules, automated billing cycles, retainers
• ☐ Delivery Challans: Supply on approval, job work dispatch, challan-to-invoice
• ☐ Payments Received: Cash, cheque, bank transfer, excess advance ledger, TDS deductions
• ☐ Credit Notes: Sales returns, price adjustments, invoice application, cash refunds
• ☐ Vendors Master: Bank account details, MSME registration, TDS categories
• ☐ Direct Expenses: Operational expenditures, tax claimable, paid through account
• ☐ Recurring Expenses: Software subscriptions, office leases, recurring supplier bills
• ☐ Purchase Orders: Vendor delivery schedules, commercial agreement, tolerance limits
• ☐ Vendor Bills: AP liability booking, 3-way matching with PO and GRN
• ☐ Recurring Bills: Retainers to suppliers, monthly utility liabilities
• ☐ Payments Made: Vendor remittance, cheque prints, RTGS/NEFT UTR reference
• ☐ Vendor Credits: Debit notes against returned goods, bill offsets
• ☐ Projects and Budgets: Hourly billing vs fixed budget, cost vs revenue budgets
• ☐ Timesheets: Employee logged hours, billable vs non-billable splits
• ☐ Bank Accounts: Current, savings, petty cash, escrow accounts
• ☐ Bank Reconciliation: Statement CSV import, automated matching rules
• ☐ Banking Rules: Automated category assignments on bank import
• ☐ Manual Journals: Multi-line Debit/Credit vouchers, accruals, depreciation
• ☐ Chart of Accounts (COA): 5-level hierarchical COA (Assets, Liabilities, Equity, Income, Expense)
• ☐ Budgets: Fiscal year monthly expense budgets vs actuals
• ☐ Transaction Locking: Period close audit locks preventing backdated tampering
• ☐ Fixed Assets: Asset register, depreciation schedules, disposal logs
• ☐ Inter-Company Accounting: Cross-entity transfers and due-to/due-from ledgers
• ☐ Financial Dimensions: Cost centers, departments, projects, branches
• ☐ Fiscal Calendars: Custom accounting calendar periods
• ☐ Tax Settings and Compliance: GST rates, TDS tax slabs, GSTR-1 and GSTR-3B audit registers
• ☐ Treasury Forecasting: Cash-flow runway projections
• ☐ Year-End Closing: Closing revenue/expense into retained earnings
• ☐ Financial Statements: P&L, Balance Sheet, Cash Flow, Trial Balance, General Ledger, AR/AP Aging
17.2 Billing Domain (30 Features)
• ☐ Subscription Plans: Flat-fee, tiered pricing, volume tiers, freemium
• ☐ Add-ons and Metered Items: Storage GB, API calls, user license overages
• ☐ Promo Coupons: Percentage/fixed discounts, max redemptions, expiry limits
• ☐ Pricing Widgets: Embeddable client pricing tables and checkout
• ☐ Item Catalog: Services and hardware bundle items
• ☐ Subscriptions Engine: Profile lifecycle (Trial, Active, Paused, Suspended, Cancelled)
• ☐ Mid-Cycle Upgrades/Downgrades: Mathematical proration calculation engine
• ☐ Recurring Invoicing Engine: Automated monthly invoice generation on cycle dates
• ☐ Quotes and Proposals: Commercial proposals with 1-click conversion
• ☐ Credit Notes and Refunds: SLA credits, gateway refunds, advance balances
• ☐ Payments Received: Multi-channel collections, invoice allocation, receipts
• ☐ Payment Gateway Setup: Razorpay, Zoho Payments, Stripe webhooks and tokenization
• ☐ Smart Dunning Matrix: Exponential backoff retries on failed recurring card charges
• ☐ Customer Credit Balance: Excess payments auto-credited to next month's invoice
• ☐ Client Projects: Billing rates, labor budget vs revenue budget, realization rate
• ☐ Billable Timesheets: Daily hours logging, 1-click invoice generation
• ☐ Operational Expenses: Direct operating expenses
• ☐ Recurring Subscriptions: Internal software/cloud subscriptions
• ☐ Lifecycle and Webhooks: Real-time webhook listener and audit history
• ☐ MRR Waterfall Analytics: New MRR, Expansion MRR, Contraction MRR, Churn MRR
• ☐ ARR Forecast: Annual recurring revenue projection
• ☐ Churn Analysis: Customer churn vs revenue churn
• ☐ Cohort Retention: Month-by-month subscriber retention curves
• ☐ LTV / ARPU Reports: Lifetime value and average revenue per user
• ☐ Trial Conversion Reports: Free-to-paid conversion funnel
• ☐ Dunning Retries Analytics: Recovery rate on failed card payments
• ☐ Receivables Summary: Aging of subscription receivables
• ☐ Plan Performance: Subscriber distribution by plan tier
• ☐ Add-on Consumption: Usage metrics analytics
• ☐ Documents Vault: Centralized subscriber document storage
17.3 Inventory Domain (32 Features)
• ☐ Items and Products Master: Barcodes, dimensions, weight, preferred vendors, UoM conversion table
• ☐ Item Variants: Multi-attribute matrices (Size, Color, Material, Voltage)
• ☐ Bill of Materials (BOM): Multi-level sub-assemblies, scrap percentages
• ☐ Multi-Warehouse Locations: Zonal fulfillment centers, regional hubs
• ☐ Stock State Model: Location, Status and Reservation dimensions (v2 ke 9-bucket ka v3 form)
• ☐ Directed Putaway: Dock-to-Rack barcode slotting; ATP unlocks strictly upon bin scan
• ☐ Move Orders: Internal bin-to-bin relocation without changing company total stock
• ☐ Inter-Warehouse Transfer Orders: Highway in-transit isolation between hubs
• ☐ Stock Adjustments and Shrinkage: Tiered approval ladder with ADJ_HOLD
• ☐ Purchase Orders: Commercial agreement, expected incoming supply tracking
• ☐ Dock Inward and 3-Way Match: Vendor challan vs physical boxes vs PO match
• ☐ Line-Item QC Split: Accepted to GRN vs Rejected to Quarantine with debit note claim
• ☐ Sales Order Commitment: Reservation table (Zero Overselling)
• ☐ Order Fulfillment Queue: Automated picking wave routing based on batch availability
• ☐ Carton Packaging and Slips: Box weight measurement, packing slips, tamper barcode seal
• ☐ Courier Dispatch (AWB Handover): Carrier handover, stock derecognition, COGS and Revenue posting
• ☐ Delivery Challans: Non-invoice physical goods transfer, job work, sample issue
• ☐ Sales Returns (RMA): Reverse logistics intake, QC triage (Restock vs Refurbish vs Scrap)
• ☐ Manufacturing Work Orders: 3-Gate execution (Release, RM Kitting to WIP, FG Capitalization)
• ☐ MRP Material Netting: Net Req = Demand + Safety Stock - ATP - Supply
• ☐ Production Routings: Multi-station assembly operations and standard times
• ☐ Machines and Work Centers: Machine capacity, maintenance schedules, hourly machine rates
• ☐ FEFO / FIFO Batch Tracking: First-Expired First-Out picking engine
• ☐ Serial Number Tracking: Individual unit serial number tracking from receipt to dispatch
• ☐ Reorder Point Automation: Minimum stock alerts and automated PR generation
• ☐ Safety Stock Buffers: Buffer calculations to prevent stock-outs
• ☐ Inventory Valuation Engine: FIFO and Weighted Average Cost (WAC) calculations
• ☐ ABC Classification: High-value vs fast-moving inventory segmentation
• ☐ Slow/Fast Moving Analysis: Aging and turnover velocity reports
• ☐ AI Supply Insights: Anomaly detection on demand and supplier lead times
• ☐ Supply Chain Reports: Stock valuation, stock ledger audit trail, transit reports
• ☐ Documents Vault: Vendor compliance certificates and shipping documents
17.4 V2 Added Controls (18 Features)
• ☐ RTO and Return Reverse Flow: RETURN_PENDING_QC, credit note, COGS reversal at original cost (Flow 6)
• ☐ E-Invoice (IRN): IRN and QR before invoice final (Flow 7)
• ☐ E-Way Bill: Validity check at dispatch and transfer gate (Flow 7)
• ☐ TDS/TCS Rate Table: Vendor-category based, effective-dated, no hardcoded section (Flow 1, 7)
• ☐ RCM and GSTR-2B ITC Reconciliation: Self-invoice, ITC hold on mismatch (Flow 7)
• ☐ MSME Payment Tracker: 45 ya 15 din alerts, 43B(h) report (Flow 1, 7)
• ☐ SSP Revenue Allocation: Hardware point-in-time, SaaS over-time; GST value alag (Flow 3)
• ☐ RBI Pre-Debit and AFA Rules in Dunning: 24-hour notice, additional authentication above limit (Flow 3)
• ☐ Partial Shipment and Backorder Queue: Invoice on dispatch-ready quantity only (Flow 8)
• ☐ Landed Cost Allocation: Freight, insurance, customs into inventory cost (Flow 8)
• ☐ Valuation Method Lock: Change only at year start with approval (Flow 8)
• ☐ Multi-Currency and Forex: Realized and unrealized gain or loss, authorized rate table (Flow 8)
• ☐ Cumulative Adjustment Limits: Per user, per SKU, per warehouse, plus frequency alerts (Flow 5)
• ☐ Segregation of Duties Matrix: Role-assignment and runtime enforcement (Flow 9)
• ☐ RBAC with Delegation: Documented delegate, audit-logged (Flow 9)
• ☐ Atomic Multi-Document Transactions: Replica-set transactions, GL and stock together (Flow 9)
• ☐ Idempotency and Outbox: Webhook replay protection, event retry and dead-letter (Flow 9)
• ☐ Immutable Audit Trail and Failure Recovery: Append-only ledgers, controlled manual override (Flow 9)
17.5 V3 Added Controls (24 Features)
• ☐ Three-Dimension Stock Model: Location, Status, Reservation; corrected ATP formula (3.2, 3.3)
• ☐ Invoice, IRN, Dispatch Sequence: Dispatch Clearing and Sales Clearing accounts (6.1)
• ☐ Control Transfer Flag: Per-contract DISPATCH or DELIVERY, forced at onboarding (6.1)
• ☐ GRNI and PPV: GRN accrual, price variance, GRNI aging (5.1)
• ☐ ITC Pending, Rule 37 and ITC Time Limit: Rejected-unit ITC, 180-day tracker, Section 16(4) alert (5.1, 11)
• ☐ AQL QC Sampling, PO Partial Receipt and Short Close (5.1, 5.3)
• ☐ Import Purchase: BoE, duties, import IGST, forex payable (5.5)
• ☐ Reservation Expiry and Rep Cap: Aging auto-release (6.3)
• ☐ Future ATP and Promise Date: Sales visibility (3.3, 6.5)
• ☐ Credit Hold SLA, Counter Recompute and Emergency Window (6.2)
• ☐ Pick Exceptions and Dwell Alerts: Short-pick, abandoned cart, carton count (6.4, 15.6)
• ☐ ADJ_HOLD and Tiered Approval Ladder (9.2, 9.3)
• ☐ Scrap Lifecycle: Destroy, sell, claim, with witness and GST (9.4)
• ☐ Soft Close, Hard Close, Audit Adjustment Period, Module-wise Lock (9.5)
• ☐ Proration Edge Cases: First period, metered, coupons, annual-to-monthly (7.3)
• ☐ Gateway Settlement, Fees and Chargebacks (14.2)
• ☐ COD Reconciliation (14.3)
• ☐ Customer TDS Receivable and 26AS Reconciliation (14.4)
• ☐ Bad Debt and ECL Provision (14.5)
• ☐ Offline Scanner Mode and Conflict Queue (15.3)
• ☐ Provisional Receipt and Controlled Exceptions (15.4)
• ☐ Control Profiles and Small-Team SoD Fallback (3.6, 15.5)
• ☐ Collusion Analytics and Rotation (13.8)
• ☐ Ledger-Style Balances and Per-Entity Hash Chain (13.3, 13.5)
18. Test Case Catalog
Teen tarah ke tests hain. T-series (negative): har lock ka ek acceptance test; ID T-<lock number>. P-series (positive): har flow ka happy-path test, numbers ke saath. R-series (report): analytics aur reports ke liye fixture-based reconciliation. Lock ya feature tabhi Tested maana jaayega jab uske saare linked tests automated suite me pass hon. Testable-form rule: jahan lock me 'audit-logged' likha hai, wahan expected result me log record ke fields (user, role, timestamp, reason, document) check hote hain.
18.1 Flow 1: Procure-to-Pay (Negative)
Test ID
Setup
Expected
T-1.1
PO 100, receive 150
105 tak accept; 106vi unit par 422; excess stock me nahi, bill me nahi; Rejected at Gate ya Excess Hold record
T-1.2
Dock stock 100 (QC_HOLD), SO banao
ATP 0; Error: 0 units available for sale
T-1.3
Quarantine item ko sellable bin me putaway try
Putaway engine reject
T-1.4
Same vendor invoice no. + GSTIN dobara enter
409 Duplicate Vendor Invoice
T-1.5
Bill rate PO se 5% zyada (tolerance 2%)
Bill Blocked for Variance; payment run me nahi
T-1.6
Bill bina GRN
Bill Hold; payment block
T-1.7
Vendor bank detail change
Checker approval aur callback ke bina save nahi; pehle payment par 48-hour hold
T-1.8
Ek user PO banaye aur GRN post kare
Second action refuse
T-1.9
Near-expiry batch receipt
QUARANTINE aur debit note claim
T-1.10
PO 20% short, approval ke bina close
Block; Short Close ke liye approval, reason, vendor notice
T-1.11
GRN post, AQL sample result ke bina
GRN block
T-1.12
GRN hua, 31 din tak bill nahi
GRNI aging alert; period-end accrual me dikhta hai
T-1.13
Vendor advance, PO link ke bina
Block; unlinked advance 60 din par alert
T-1.14
GSTR-3B ITC prepare, ITC Pending line ke saath
ITC Pending claimable ITC me shamil nahi
T-1.15
MSME bill, agreement 45 din, payment pending
Alert due date se pehle; due date par escalation; payment run me priority
T-1.16
1 box (12 pcs) receive, UoM mapping ke saath; UoM bina GRN
Stock +12 pcs; UoM bina GRN refuse
18.2 Flow 2: Order-to-Cash (Negative)
Test ID
Setup
Expected
T-2.1
Stock 5, do concurrent SO 5-5
Ek pass; doosre ko 409; stock kabhi negative nahi
T-2.2
Overdue 10,00,000, limit 5,00,000, naya SO
On Hold: Credit Limit Exceeded; rep release nahi kar sakta
T-2.3
Expiring (7 din) batch scan
Red beeper; manifest block
T-2.4
AWB token ke bina dispatch confirm
Stock deduct nahi
T-2.5
Do concurrent SO, limit sirf ek ke liye
Ek pass; doosre ko 409 Credit Reservation Conflict
T-2.6
Discount limit se upar, ya price floor ke neeche
Approval maange; floor ke neeche SO block
T-2.7
Galat SKU ya weight mismatch pack
Seal block
T-2.8
60 of 100 dispatch-ready
Invoice 60 par
T-2.9
Delivery fail
RTO flow trigger
T-2.10
Confirmed SO 15 din se unshipped, confirm nahi
Reservation auto-release; stock ATP me wapas; rep ko notice
T-2.11
Invoice Final, window me dispatch nahi
Alert; IRN cancel ya dispatch; Dispatch Clearing aging; Final invoice ke bina dispatch block
T-2.12
Manifest 10 cartons, driver sign 8
Sirf 8 deduct; 2 OUTBOUND_BAY me; dispute record
T-2.13
SO cancel aur edit ke baad
Credit counter release; daily recompute me drift 0
T-2.14
Contract ka control transfer mode badlo
Finance approval; flag ke bina customer activate nahi
T-2.15
Expired quote se SO
Block; re-price zaroori
T-2.16
Ek picker ke din me 5 short-picks
Har par priority recount; analytic alert
T-2.17
Cart me maal shift end ke baad
Alert; sweep task; supervisor sign-off
18.3 Flow 3: Recurring-to-Revenue (Negative)
Test ID
Setup
Expected
T-3.1
Upgrade phir 2 din me downgrade
Exact-day proration; delta credit balance me; cash refund nahi
T-3.2
Card fail
Retry sirf Day 0, 3, 7, 10 (notice ke saath); Day 10 ke baad Suspended
T-3.3
Rs 10,000 credit note do invoices par ek saath
Ek apply; doosra fail
T-3.4
Same gateway webhook do baar
Ek posting; replay par koi naya effect nahi
T-3.5
Same card se doosra trial
Trial deny
T-3.6
Minimum term se pehle cancel
Early-termination invoice
T-3.7
Refund alag instrument par
Block; Finance approval
T-3.8
Services ka advance receipt
Receipt voucher auto; GST post
T-3.9
Chargeback, service use ho chuki
Disputed Receivable; deadline tracker; evidence pack
T-3.10
Same usage event do baar ingest
Ek hi count; invoice line se source traceable
T-3.11
Policy se zyada coupons stack
Dusra coupon reject
18.4 Flow 4: Manufacturing (Negative)
Test ID
Setup
Expected
T-4.1
WO release, ek component ATP 0
422 Missing Components
T-4.2
Input 9 batteries, output 8 FG, 1 loss bina reason
Capitalization block; scrap reason zaroori
T-4.3
80% kit
Default block; partial par approval
T-4.4
BOM se zyada issue
Supervisor approval
T-4.5
Serial battery recall query
FG serial traceable
T-4.6
Open WIP ke saath WO close
Block
18.5 Flow 5: Governance (Negative)
Test ID
Setup
Expected
T-5.1
Rs 1,50,000 write-off
Tier 2 Pending Approval; units ADJ_HOLD; stock deduct nahi jab tak approvers approve na karein
T-5.2
Hard-closed period invoice edit
403 Financial Period Closed
T-5.3
Transfer 30, receive 25
25 add; 5 TRANSIT_INTERWH me UNDER_INVESTIGATION; ticket aur claim
T-5.4
Rs 4,900 ke 30 adjustments
Cumulative limit par approval aur alert
T-5.5
Excess entry bina reason
Reject; blind recount aur reason
T-5.6
Ledger update ya delete API
Exist nahi; DB delete permission nahi
T-5.7
Closed period me stock movement
Block
T-5.8
ADJ_HOLD units par SO
ATP me count nahi
T-5.9
Scrap bay se maal disposition ke bina bahar
Block; dual-key; aging alert
T-5.10
Count screen
System qty hidden; recount alag user se
T-5.11
Soft-close entry value cap se upar, approval ke bina
Block; Finance Director report
T-5.12
Alag GSTIN transfer, tax invoice ke bina
Dispatch block
18.6 Flow 6: Returns (Negative)
Test ID
Setup
Expected
T-6.1
Return serial original se alag
Hold; credit note block
T-6.2
Sold 10, returned 6, ab 6 aur
Block; max 4
T-6.3
Window ke baad return
Block; override approval
T-6.4
QC pass ke bina putaway
Task generate nahi
T-6.5
Ek return par do credit
Doosra block
T-6.6
AWB RTO bina dock scan
Stock wapas nahi; draft only
T-6.7
Refund alag account
Block; approval
T-6.8
Closed period credit note
Current period me, original reference ke saath
18.7 Flow 7: Compliance (Negative)
Test ID
Setup
Expected
T-7.1
Dispatch bina e-way bill (value Rs 50,000 se upar)
Manifest block
T-7.2
E-invoice applicable, IRN nahi
Invoice Draft; email block
T-7.3
Interstate sale, CGST+SGST override
Approval ke bina block
T-7.4
GSTR-2B me bill nahi
ITC hold
T-7.5
PAN missing vendor
Higher TDS rate
T-7.6
Credit note statutory date ke baad
Warning aur Finance review
T-7.7
IRN window ke baad cancel
Cancel disabled; credit note
T-7.8
Rate change ke baad naya invoice
Nayi rate; purani rate nahi
T-7.9
Vendor 150 din unpaid
Alert; 180 din par reversal task; payment par re-claim
T-7.10
ITC deadline ke baad claim
Block; Finance review
T-7.11
IRP window ke baad invoice report
Block; Finance review
T-7.12
MSME overdue, year-end
43B(h) report me listed
T-7.13
Books vs GSTR-1 paise ka fark
Single rounding method; daily recon me flag
18.8 Flow 8: Cost and Currency (Negative)
Test ID
Setup
Expected
T-8.1
Dispatch 60, invoice 100 try
Block
T-8.2
Backorder priority manual badlo
Approval aur log
T-8.3
Allocation basis badlo
Approval aur revaluation
T-8.4
Mid-year method change
Block
T-8.5
Manual forex rate
Approval aur alert
T-8.6
Landed cost sold stock ke baad
Variance posting
T-8.7
Negative stock valuation
Sellable negative stock possible hi nahi
T-8.8
Ship Complete SO N din hold
Alert aur Partial Approval option
18.9 Flow 9: Platform (Negative)
Test ID
Setup
Expected
T-9.1
Incompatible roles assign
Block; CFO exception
T-9.2
Self-delegation approval
Block
T-9.3
DB direct edit try
Permission nahi; hash-chain mismatch alert
T-9.4
Purana webhook replay
Signature, timestamp aur idempotency se reject
T-9.5
Courier API healthy hote hue override
Reject; outage evidence chahiye
T-9.6
Posting beech me crash
Dono rollback; daily recon match
T-9.7
Period unlock
Dual approval, reason, time-box, auditor notice
T-9.8
Same maker-approver pair 20 baar
Collusion alert
T-9.9
Ek login do jagah concurrent
Alert; doosra session block ya flagged
18.10 Flow 10: Finance Operations (Negative)
Test ID
Setup
Expected
T-10.1
Settlement captured se kam
Unmatched queue; 3 din par alert
T-10.2
Chargeback response deadline paas
Reminder aur escalation
T-10.3
COD remittance 2 AWB kam
AWB-wise dispute; payable set-off
T-10.4
Customer TDS 26AS me missing
TDS Receivable aging; follow-up; write-off approval
T-10.5
Bad debt write-off bina approval
Block; maker-checker
T-10.6
Asset disposal bina approval ya invoice
Block
T-10.7
Inter-company ek taraf entry
Mirror posting ek transaction me; mismatch report
T-10.8
Year-end close open bank rec ke saath
Hard-gate block
T-10.9
Month-end soft close bank rec ke bina
Close block
18.11 Flow 11: Operating Rules (Negative)
Test ID
Setup
Expected
T-11.1
Lean Mode me mandatory scan skip
Reject; Lean Mode sirf risk-based scans
T-11.2
Offline event bin pehle khali hone par sync
Conflict Queue; silent overwrite nahi
T-11.3
Negative-stock window batch item par
Block; sirf non-batch low-value
T-11.4
Single-operator shift high-value adjust
Cap par block; photo evidence; next-day review
T-11.5
Manual barcode entry bina supervisor PIN
Block; frequency alert
T-11.6
Count ke dauran pick
Variance snapshot plus net movement se sahi
T-11.7
Provisional receipt 24 ghante se zyada
Alert; convert ya Rejected at Gate
T-11.8
Unmatched return 48 ghante
Alert; RMA link ya reject
18.12 Positive Flow Tests (P-series)
Test ID
Setup
Expected
P-1.1
PO 100, receive 100, QC 95 pass 5 fail
PO par GL 0; GRN 95: Dr Inventory 2,66,000 / Cr GRNI 2,66,000; 5 units QUARANTINE
P-1.2
Vendor bill 100 x Rs 2,800 + 18% GST
AP Rs 3,30,400; GRNI clear; Vendor Return Receivable 14,000; ITC Pending 2,520; claimable ITC 47,880
P-1.3
Supplier credit note 5 units
AP net Rs 3,13,880; Return Receivable aur ITC Pending clear
P-1.4
Putaway bin scan
ATP +95 sirf bin scan par
P-1.5
PO 100, receive 60, phir close
Partial status; baaki Expected Incoming; closed PO par GRN refuse
P-1.6
Import USD 1,000, BoE
Landed cost Rs 92,130 + freight; Input IGST Rs 16,583.40 alag; BoE unique
P-1.7
MSME vendor payment
Due date agreement ke hisaab se (45 ya 15); time par paid
P-2.1
On-hand 50, unpicked reservations 20
ATP 30; 5 pick ke baad bhi ATP 30
P-2.2
Quote se SO
Price validity tak locked; Expected Availability dikhti hai
P-2.3
Pack se dispatch, 20 units
Invoice Final with IRN aur e-way bill; Dispatch par: COGS 60,000, AR 94,400, Revenue 80,000; Dispatch Clearing aur Sales Clearing zero; margin 20,000
P-2.4
DELIVERY-mode contract
Dispatch par Goods in Transit; Revenue aur COGS sirf delivered status par
P-2.5
60 of 100 dispatch
Invoice 60; backorder 40; naya stock FIFO se allocate
P-2.6
Credit hold, Finance release SLA me
SO release; counter sahi
P-2.7
Payment allocation
Exposure kam; invoice settle
P-3.1
12-month prepaid Rs 30,000 + GST
Allocation 5,675.68 / 24,324.32; Day-1 journal Rs 35,400; 11 x 2,027.03 + 2,026.99
P-3.2
Upgrade Rs 2,500 se 4,000, 12 din bache
Delta Rs 600; downgrade par -600 credit balance
P-3.3
Dunning timeline
Invoice D-3, notice D-2, charge D-0
P-3.4
Metered usage
Cycle-end arrears me bill; prorate nahi
P-3.5
Calendar-billing plan, mid-month signup
Pehla period din-wise prorated
P-4.1
Demand 10, safety 1, on-hand 2
Net 9; BOM explosion 9, 18, 9, 18.9m
P-4.2
WO 9 units, 3 gates
Standard cost Rs 2,52,945; FG capitalization
P-5.1
Move order bin-to-bin
Total unchanged; ledger record
P-5.2
Transfer alag GSTIN 30 units
Tax invoice aur e-way bill; TRANSIT_INTERWH; receive par add
P-5.3
Cycle count excess 2 units Rs 2,000
Blind recount; reason code; Tier 0 auto-approve
P-5.4
Scrap request
Tier approval; SCRAP_BAY; destroy with witness; GL Dr Scrap Loss / Cr Inventory
P-5.5
Soft close phir hard close
Soft me late bill approval ke saath; hard close par block
P-6.1
2 units return (of 20)
Credit note Dr Sales Returns 8,000, GST 1,440, Cr AR 9,440; COGS reversal 6,000 original cost par
P-6.2
RTO, seal intact
QC ke baad restock; credit note draft
P-6.3
DELIVERY-mode RTO
Goods in Transit aur clearing reverse
P-7.1
Interstate aur intrastate
IGST ya CGST + SGST; Rs 14,400
P-7.2
IRN aur e-way bill valid
Dispatch accept
P-7.3
GSTR-2B recon
Matched ITC claimable; mismatch hold
P-7.4
Vendor payment TDS
Rate vendor category rate-table se
P-7.5
RCM purchase
Self-invoice, liability aur ITC post
P-8.1
Freight Rs 4,750 on 95 units
Landed unit cost Rs 2,850
P-8.2
100 at 2,850 + 50 at 3,000
WAC 2,900; FIFO issue order
P-8.3
Export USD 1,000
Rs 83,000 invoice; Rs 84,000 receipt; Rs 1,000 realized gain
P-9.1
Alag users PO, GRN, payment
Sab succeed
P-9.2
Posting me failure inject
Stock aur GL dono rollback; Debit = Credit
P-9.3
Same webhook replay
Pehla result lauta; naya effect nahi
P-9.4
Hash chain verify
Per warehouse per day verify; tamper detect
P-9.5
Courier API down, override evidence ke saath
Approved; tentative COGS flag; baad me reconcile
P-10.1
Settlement of capture Rs 35,400
Bank Rs 34,564.56; fee Rs 708; GST Rs 127.44
P-10.2
COD 10 AWB Rs 40,000
Bank Rs 39,056; fee 800; GST 144
P-10.3
Invoice Rs 1,18,000, TDS Rs 2,000
Bank Rs 1,16,000; TDS Receivable Rs 2,000; AR clear
P-10.4
Bank statement import
Auto-match; unmatched queue
P-10.5
Depreciation aur disposal
Monthly journal; disposal gain ya loss
P-10.6
Year-end close
Pre-checklist pass; P&L retained earnings me close
P-11.1
20 offline scans
Sync; duplicates nahi; conflicts queue me
P-11.2
Provisional receipt
24 ghante me convert
P-11.3
Lean Mode on
Risk-based scans merge; mandatory gates intact
P-11.4
Go-live checklist (15.9)
Saare 10 items green
18.13 Report Tests (R-series)
Test ID
Setup
Expected
R-1
MRR waterfall fixture
New + Expansion - Contraction - Churn = closing - opening MRR
R-2
ARR forecast, churn, cohort, LTV/ARPU, trial conversion fixtures
Hand-computed values se match
R-3
Valuation, stock ledger, transit reports
GL Inventory control se tie
R-4
ABC aur slow/fast moving
Fixture classification match
R-5
AI Supply Insights seeded anomaly
Anomaly flag; normal data par flag nahi
R-6
Documents Vault
Upload, role access, retention, audit log
R-7
Pricing widget aur checkout
Widget price = plan price; subscription create; tax sahi
18.14 Matrix se Test Mapping
Matrix group
Linked tests
Books: masters (Items, Customers, Vendors)
P-1.1 to P-1.7, T-1.4, T-1.7, T-1.16
Books: Quotes, Sales Orders, Tax Invoices, Challans
P-2.2, P-2.3, T-2.6, T-2.15, T-7.2, T-7.3
Books: Credit Notes, Payments, Bank
P-6.1, P-2.7, P-10.3, P-10.4, T-6.5, T-10.9
Books: Locking, Journals, COA, Fiscal, Year-End
P-5.5, P-10.6, T-5.2, T-5.7, T-5.11, T-10.8
Books: Fixed Assets, Inter-Company
P-10.5, T-10.6, T-10.7
Books: Financial Statements
P-9.2, R-3 (ledger ties), daily recon
Billing: Plans, Subscriptions, Proration, Coupons
P-3.1, P-3.2, P-3.5, T-3.1, T-3.6, T-3.11
Billing: Gateway, Dunning, Credit Balance
P-3.3, P-10.1, T-3.2, T-3.3, T-3.4, T-9.4
Billing: Analytics, Widgets, Vault
R-1, R-2, R-6, R-7
Inventory: Stock model, Putaway, ATP, Reservation
P-1.4, P-2.1, T-1.2, T-2.1, T-2.10
Inventory: Dispatch, Returns, Transfers
P-2.3, P-6.1, P-5.2, T-2.4, T-5.3, T-6.x
Inventory: Manufacturing and MRP
P-4.1, P-4.2, T-4.1 to T-4.6
Inventory: Valuation and Reports
P-8.1, P-8.2, R-3, R-4, R-5
V2 and V3 controls
Jis Flow ka control hai, uske P aur T tests (Section column dekho)
Total 176 tests: Negative T-series 117 (Flow 1: 16, Flow 2: 17, Flow 3: 11, Flow 4: 6, Flow 5: 12, Flow 6: 8, Flow 7: 13, Flow 8: 8, Flow 9: 9, Flow 10: 9, Flow 11: 8), Positive P-series 52, Report R-series 7.
End of Master Cross-Domain Enterprise ERP Flow v3.

yeh doc btao yeh kitna strong hai first wala doc se changes kre ya second wala kre
</USER_REQUEST>
<ADDITIONAL_METADATA>
The current local time is: 2026-10-29T12:31:36+05:30.
</ADDITIONAL_METADATA>