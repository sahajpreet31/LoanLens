import { useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ReferenceLine, ResponsiveContainer, Cell
} from "recharts";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const RISK_CONFIG = {
  Low:    { color: "#10b981", bg: "rgba(16,185,129,0.08)",  border: "rgba(16,185,129,0.3)",  gradient: "linear-gradient(135deg,#10b981,#059669)", icon: "✓", label: "Low Risk",    borrowerLabel: "Likely to be Approved",    borrowerMsg: "Your profile looks strong. You have a good chance of loan approval."  },
  Medium: { color: "#f59e0b", bg: "rgba(245,158,11,0.08)",  border: "rgba(245,158,11,0.3)",  gradient: "linear-gradient(135deg,#f59e0b,#d97706)", icon: "◈", label: "Medium Risk",  borrowerLabel: "Approval Not Guaranteed",  borrowerMsg: "Your profile shows some risk factors. Lenders may ask for more details or offer a smaller loan." },
  High:   { color: "#ef4444", bg: "rgba(239,68,68,0.08)",   border: "rgba(239,68,68,0.3)",   gradient: "linear-gradient(135deg,#ef4444,#dc2626)", icon: "✕", label: "High Risk",    borrowerLabel: "High Chance of Rejection", borrowerMsg: "Your current profile may not meet lender requirements. See suggestions below to improve your chances." },
};

const EXAMPLE_PROFILES = [
  {
    key: "low", label: "Low Risk", desc: "Stable income, good grade, short loan",
    color: "#10b981", bg: "rgba(16,185,129,0.06)", border: "rgba(16,185,129,0.2)",
    form: { person_age: "34", person_income: "85000", person_emp_length: "8", person_home_ownership: "MORTGAGE", loan_amnt: "8000", loan_intent: "EDUCATION", loan_grade: "A", loan_int_rate: "7.5", loan_percent_income: "0.09", cb_person_default_on_file: "N", cb_person_cred_hist_length: "10" }
  },
  {
    key: "medium", label: "Medium Risk", desc: "Average profile, moderate loan burden",
    color: "#f59e0b", bg: "rgba(245,158,11,0.06)", border: "rgba(245,158,11,0.2)",
    form: { person_age: "29", person_income: "48000", person_emp_length: "3", person_home_ownership: "RENT", loan_amnt: "14000", loan_intent: "PERSONAL", loan_grade: "C", loan_int_rate: "14.5", loan_percent_income: "0.29", cb_person_default_on_file: "N", cb_person_cred_hist_length: "5" }
  },
  {
    key: "high", label: "High Risk", desc: "Low income, poor grade, previous default",
    color: "#ef4444", bg: "rgba(239,68,68,0.06)", border: "rgba(239,68,68,0.2)",
    form: { person_age: "23", person_income: "22000", person_emp_length: "1", person_home_ownership: "RENT", loan_amnt: "18000", loan_intent: "VENTURE", loan_grade: "E", loan_int_rate: "22.5", loan_percent_income: "0.82", cb_person_default_on_file: "Y", cb_person_cred_hist_length: "2" }
  }
];

const LENDER_FIELDS = [
  { key: "person_age",                 label: "Applicant Age",              type: "number", min: 18,  max: 100,             group: "personal" },
  { key: "person_income",              label: "Annual Income",               type: "number", min: 1,                         group: "personal" },
  { key: "person_emp_length",          label: "Employment Length (yrs)",     type: "number", min: 0,   max: 60,              group: "personal" },
  { key: "person_home_ownership",      label: "Home Ownership",              type: "select", options: ["RENT","OWN","MORTGAGE","OTHER"], group: "personal" },
  { key: "loan_amnt",                  label: "Loan Amount Requested",       type: "number", min: 1,                         group: "loan"     },
  { key: "loan_intent",                label: "Loan Purpose",                type: "select", options: ["PERSONAL","EDUCATION","MEDICAL","VENTURE","HOMEIMPROVEMENT","DEBTCONSOLIDATION"], group: "loan" },
  { key: "loan_grade",                 label: "Credit Grade",                type: "select", options: ["A","B","C","D","E","F","G"], group: "loan" },
  { key: "loan_int_rate",              label: "Proposed Interest Rate (%)",  type: "number", min: 0.1, step: "0.1",          group: "loan"     },
  { key: "loan_percent_income",        label: "Loan-to-Income Ratio (0–1)", type: "number", min: 0.01,max: 1,  step: "0.01", group: "loan"     },
  { key: "cb_person_default_on_file",  label: "Prior Default on Record?",    type: "select", options: ["N","Y"],              group: "credit"   },
  { key: "cb_person_cred_hist_length", label: "Credit History Length (yrs)", type: "number", min: 0,                         group: "credit"   },
];

const BORROWER_FIELDS = [
  { key: "person_age",                 label: "Your Age",                   type: "number", min: 18,  max: 100,             group: "personal" },
  { key: "person_income",              label: "Your Annual Income",          type: "number", min: 1,                         group: "personal" },
  { key: "person_emp_length",          label: "Years Employed",              type: "number", min: 0,   max: 60,              group: "personal" },
  { key: "person_home_ownership",      label: "Home Ownership Status",       type: "select", options: ["RENT","OWN","MORTGAGE","OTHER"], group: "personal" },
  { key: "loan_amnt",                  label: "Loan Amount You Need",        type: "number", min: 1,                         group: "loan"     },
  { key: "loan_intent",                label: "What is the Loan For?",       type: "select", options: ["PERSONAL","EDUCATION","MEDICAL","VENTURE","HOMEIMPROVEMENT","DEBTCONSOLIDATION"], group: "loan" },
  { key: "loan_grade",                 label: "Your Credit Grade",           type: "select", options: ["A","B","C","D","E","F","G"], group: "loan" },
  { key: "loan_int_rate",              label: "Expected Interest Rate (%)",  type: "number", min: 0.1, step: "0.1",          group: "loan"     },
  { key: "loan_percent_income",        label: "Loan as % of Your Income (0–1)", type: "number", min: 0.01, max: 1, step: "0.01", group: "loan" },
  { key: "cb_person_default_on_file",  label: "Have You Defaulted Before?", type: "select", options: ["N","Y"],              group: "credit"   },
  { key: "cb_person_cred_hist_length", label: "Years of Credit History",     type: "number", min: 0,                         group: "credit"   },
];

const WHATIF_FIELDS = [
  { key: "person_income",       label: "Annual Income",     min: 10000, max: 500000, step: 5000 },
  { key: "loan_amnt",           label: "Loan Amount",       min: 500,   max: 50000,  step: 500  },
  { key: "loan_int_rate",       label: "Interest Rate (%)", min: 5,     max: 30,     step: 0.5  },
  { key: "person_emp_length",   label: "Employment (yrs)",  min: 0,     max: 40,     step: 1    },
  { key: "loan_percent_income", label: "Loan % of Income",  min: 0.01,  max: 1,      step: 0.01 },
];

const defaultForm = {
  person_age: "", person_income: "", person_emp_length: "",
  person_home_ownership: "RENT", loan_amnt: "", loan_intent: "PERSONAL",
  loan_grade: "B", loan_int_rate: "", loan_percent_income: "",
  cb_person_default_on_file: "N", cb_person_cred_hist_length: "",
};

function validate(form) {
  const e = {};
  if (!form.person_age || form.person_age < 18 || form.person_age > 100) e.person_age = "Must be 18–100";
  if (!form.person_income || form.person_income <= 0) e.person_income = "Enter a valid income";
  if (form.person_emp_length === "" || form.person_emp_length < 0 || form.person_emp_length > 60) e.person_emp_length = "Enter 0–60";
  if (!form.loan_amnt || form.loan_amnt <= 0) e.loan_amnt = "Enter a valid amount";
  if (!form.loan_int_rate || form.loan_int_rate <= 0) e.loan_int_rate = "Enter a valid rate";
  if (!form.loan_percent_income || form.loan_percent_income <= 0 || form.loan_percent_income > 1) e.loan_percent_income = "Enter 0.01–1";
  if (!form.cb_person_cred_hist_length || form.cb_person_cred_hist_length < 0) e.cb_person_cred_hist_length = "Required";
  return e;
}

function buildPayload(form) {
  return {
    person_age: parseInt(form.person_age),
    person_income: parseFloat(form.person_income),
    person_emp_length: parseFloat(form.person_emp_length),
    person_home_ownership: form.person_home_ownership,
    loan_amnt: parseFloat(form.loan_amnt),
    loan_intent: form.loan_intent,
    loan_grade: form.loan_grade,
    loan_int_rate: parseFloat(form.loan_int_rate),
    loan_percent_income: parseFloat(form.loan_percent_income),
    cb_person_default_on_file: form.cb_person_default_on_file,
    cb_person_cred_hist_length: parseInt(form.cb_person_cred_hist_length),
  };
}

function RiskGauge({ probability, riskCfg }) {
  const pct = Math.min(Math.max(probability * 100, 0), 100);
  const angle = -180 + (pct / 100) * 180;
  const r = 70, cx = 100, cy = 90;
  const toXY = (deg) => ({ x: cx + r * Math.cos(deg * Math.PI / 180), y: cy + r * Math.sin(deg * Math.PI / 180) });
  const needleTip = toXY(angle);
  const arcPath = (s2, e2, color) => {
    const sp = toXY(s2), ep = toXY(e2);
    return <path d={`M${sp.x},${sp.y} A${r},${r} 0 ${e2-s2>180?1:0},1 ${ep.x},${ep.y}`} stroke={color} strokeWidth="12" fill="none" strokeLinecap="round" />;
  };
  return (
    <svg viewBox="0 0 200 100" style={{ width: "100%", maxWidth: 220, display: "block", margin: "0 auto" }}>
      {arcPath(-180, -120, "#10b981")}
      {arcPath(-120, -60,  "#f59e0b")}
      {arcPath(-60,  0,    "#ef4444")}
      <line x1={cx} y1={cy} x2={needleTip.x} y2={needleTip.y} stroke={riskCfg.color} strokeWidth="3" strokeLinecap="round" />
      <circle cx={cx} cy={cy} r="5" fill={riskCfg.color} />
      <text x="22" y="98" fontSize="9" fill="#10b981" fontWeight="700">LOW</text>
      <text x="86" y="18" fontSize="9" fill="#f59e0b" fontWeight="700">MED</text>
      <text x="152" y="98" fontSize="9" fill="#ef4444" fontWeight="700">HIGH</text>
      <text x={cx} y={cy+20} textAnchor="middle" fontSize="16" fontWeight="800" fill={riskCfg.color}>{pct.toFixed(1)}%</text>
    </svg>
  );
}

function ImprovementSuggestions({ shapValues, riskLevel, mode }) {
  if (riskLevel === "Low") return null;
  const risky = shapValues.filter(s => s.direction === "increases_risk").slice(0, 3);
  const tips = {
    "loan_grade":                mode === "borrower" ? "Improve your credit score to qualify for a better loan grade (A or B)." : "Applicant's loan grade is a key risk factor — consider offering a smaller amount.",
    "loan_int_rate":             mode === "borrower" ? "Shop around for a lower interest rate — even 2–3% less can significantly reduce your risk." : "High interest rate is adding risk — consider revising the rate offered.",
    "cb_person_default_on_file": mode === "borrower" ? "A previous default is hurting your profile. Focus on rebuilding credit before reapplying." : "Prior default on file is a significant red flag for this applicant.",
    "loan_percent_income":       mode === "borrower" ? "Your loan amount is high relative to your income. Try applying for a smaller loan." : "Loan-to-income ratio is high — recommend a smaller loan amount.",
    "loan_to_income_ratio":      mode === "borrower" ? "Reduce the loan amount or increase your income before applying." : "Consider reducing the approved loan amount to lower this ratio.",
    "loan_amnt":                 mode === "borrower" ? "Applying for a smaller loan would improve your approval chances." : "Loan amount is high relative to the applicant's profile.",
    "int_rate_x_loan_grade":     mode === "borrower" ? "The combination of your credit grade and interest rate is increasing risk. Work on improving your grade." : "Rate and grade combination is amplifying risk.",
    "cb_person_cred_hist_length":mode === "borrower" ? "Your credit history is short. Continue building credit — it improves over time." : "Short credit history increases uncertainty for this applicant.",
    "loan_intent":               mode === "borrower" ? "Venture loans carry higher risk. Education or medical loans are viewed more favorably." : "Loan purpose (venture) carries higher default risk.",
    "person_age":                mode === "borrower" ? "Younger applicants are seen as higher risk. Building more credit history helps." : "Younger applicant — limited credit track record.",
  };
  const title = mode === "borrower" ? "💡 How to improve your approval chances" : "⚠ Key risk factors to review";
  const wrapColor = mode === "borrower" ? "rgba(245,158,11,0.06)" : "rgba(239,68,68,0.06)";
  const borderColor = mode === "borrower" ? "rgba(245,158,11,0.2)" : "rgba(239,68,68,0.2)";
  const titleColor = mode === "borrower" ? "#92400e" : "#991b1b";
  const textColor = mode === "borrower" ? "#78350f" : "#7f1d1d";
  const dotColor = mode === "borrower" ? "#f59e0b" : "#ef4444";

  return (
    <div style={{ marginTop: 20, padding: "16px 20px", background: wrapColor, border: `1px solid ${borderColor}`, borderRadius: 10 }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: titleColor, marginBottom: 12 }}>{title}</div>
      {risky.map((item, i) => (
        <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 8 }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: dotColor, marginTop: 5, flexShrink: 0, display: "block" }} />
          <span style={{ fontSize: 13, color: textColor, lineHeight: 1.5 }}>{tips[item.feature] || `${item.label} is a risk factor.`}</span>
        </div>
      ))}
    </div>
  );
}

const MODEL_COMPARISON = [
  { name: "Logistic Regression", auc: 0.822, ap: 0.598, selected: false },
  { name: "Random Forest",       auc: 0.927, ap: 0.874, selected: false },
  { name: "XGBoost",             auc: 0.942, ap: 0.897, selected: true  },
];

function ModelComparisonCard() {
  const [open, setOpen] = useState(false);
  const maxAuc = Math.max(...MODEL_COMPARISON.map(m => m.auc));

  return (
    <div style={s.scenariosCard}>
      <button onClick={() => setOpen(!open)} style={s.modelToggle}>
        <div>
          <span style={s.scenariosTitle}>🔬 How was this model built?</span>
          <span style={{ ...s.scenariosSub, display: "block" }}>
            XGBoost was selected after comparing 3 models — {open ? "hide" : "view"} the methodology
          </span>
        </div>
        <span style={{ fontSize: 18, color: "#94a3b8", transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>⌄</span>
      </button>

      {open && (
        <div style={{ marginTop: 16 }}>
          {MODEL_COMPARISON.map(m => (
            <div key={m.name} style={s.modelRow}>
              <div style={s.modelRowTop}>
                <span style={{ fontSize: 13, fontWeight: m.selected ? 700 : 500, color: m.selected ? "#2563eb" : "#475569" }}>
                  {m.name} {m.selected && <span style={s.selectedBadge}>Selected</span>}
                </span>
                <span style={{ fontSize: 13, fontWeight: 700, color: m.selected ? "#2563eb" : "#94a3b8" }}>
                  AUC-ROC: {m.auc.toFixed(3)}
                </span>
              </div>
              <div style={s.modelBarTrack}>
                <div style={{
                  ...s.modelBarFill,
                  width: `${(m.auc / maxAuc) * 100}%`,
                  background: m.selected ? "linear-gradient(90deg,#2563eb,#1d4ed8)" : "#cbd5e1"
                }} />
              </div>
            </div>
          ))}
          <p style={s.modelNote}>
            XGBoost was selected for the highest AUC-ROC (0.942) and Average Precision (0.897) on held-out test data,
            after SMOTE was applied to correct for class imbalance (~78% non-default / 22% default) in the training set.
          </p>
        </div>
      )}
    </div>
  );
}

function FormPage({ mode }) {
  const [form, setForm]       = useState(defaultForm);
  const [errors, setErrors]   = useState({});
  const [result, setResult]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);
  const [whatIf, setWhatIf]   = useState(null);
  const [whatIfLoading, setWhatIfLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("result");
  const [activeExample, setActiveExample] = useState(null);

  const fields = mode === "lender" ? LENDER_FIELDS : BORROWER_FIELDS;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
    if (errors[name]) setErrors(p => ({ ...p, [name]: null }));
    setActiveExample(null); // exit demo mode when user edits
  };

  const loadExample = (profile) => {
    setForm(profile.form);
    setErrors({});
    setResult(null);
    setActiveExample(profile.key);
  };

  const clearForm = () => {
    setForm(defaultForm);
    setErrors({});
    setResult(null);
    setActiveExample(null);
  };

  const handleSubmit = async () => {
    const ve = validate(form);
    if (Object.keys(ve).length > 0) { setErrors(ve); return; }
    setLoading(true); setError(null); setResult(null); setWhatIf(null);
    try {
      const res = await fetch(`${API_URL}/explain`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildPayload(form)),
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.detail || "Prediction failed"); }
      const data = await res.json();
      setResult(data); setWhatIf(buildPayload(form)); setActiveTab("result");
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  const handleWhatIfChange = async (key, value) => {
    const updated = { ...whatIf, [key]: parseFloat(value) };
    setWhatIf(updated); setWhatIfLoading(true);
    try {
      const res = await fetch(`${API_URL}/explain`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
      if (!res.ok) return;
      setResult(await res.json());
    } catch (_) {}
    finally { setWhatIfLoading(false); }
  };

  const grouped = {
    personal: fields.filter(f => f.group === "personal"),
    loan:     fields.filter(f => f.group === "loan"),
    credit:   fields.filter(f => f.group === "credit"),
  };

  const riskCfg = result ? RISK_CONFIG[result.risk_level] : null;
  const accentColor = mode === "lender" ? "#2563eb" : "#7c3aed";
  const btnGradient = mode === "lender"
    ? "linear-gradient(135deg,#2563eb,#1d4ed8)"
    : "linear-gradient(135deg,#7c3aed,#6d28d9)";
  const btnShadow = mode === "lender"
    ? "0 4px 12px rgba(37,99,235,0.3)"
    : "0 4px 12px rgba(124,58,237,0.3)";

  const submitLabel = mode === "lender" ? "Assess Risk →" : "Check My Eligibility →";
  const formTitle   = mode === "lender" ? "Applicant Assessment" : "Check Your Loan Eligibility";
  const formSub     = mode === "lender"
    ? "Enter the applicant's financial profile to generate a risk score and explainability report."
    : "Enter your details to see your loan approval chances and what you can do to improve them.";

  const tabs = mode === "lender"
    ? [["result","Risk Score"], ["explain","Why?"], ["whatif","Scenarios"]]
    : [["result","My Result"],  ["explain","What's Affecting Me?"], ["whatif","What If I Change This?"]];

  return (
    <div>
      {/* Demo Scenarios */}
      <div style={s.scenariosCard}>
        <div style={s.scenariosHeader}>
          <span style={s.scenariosTitle}>
            {mode === "lender" ? "Try a Sample Applicant Profile" : "See Example Profiles"}
          </span>
          <span style={s.scenariosSub}>
            {mode === "lender" ? "Load a pre-built profile to see how the model evaluates different applicants" : "See how different financial situations affect loan eligibility"}
          </span>
        </div>
        <div style={s.scenariosGrid}>
          {EXAMPLE_PROFILES.map(profile => (
            <button key={profile.key} onClick={() => loadExample(profile)} style={{
              ...s.scenarioBtn,
              background: activeExample === profile.key ? profile.bg : "#fff",
              border: `1.5px solid ${activeExample === profile.key ? profile.color : "#e2e8f0"}`,
              boxShadow: activeExample === profile.key ? `0 0 0 3px ${profile.color}18` : "none",
            }}>
              <div style={{ ...s.scenarioDot, background: profile.color }} />
              <div style={s.scenarioText}>
                <div style={{ ...s.scenarioLabel, color: profile.color }}>{profile.label}</div>
                <div style={s.scenarioDesc}>{profile.desc}</div>
              </div>
              <div style={{ ...s.scenarioArrow, color: profile.color }}>→</div>
            </button>
          ))}
        </div>
      </div>

      {/* Form */}
      <div style={s.card}>
        {activeExample && (
          <div style={s.demoBanner}>
            <span>👁 Viewing <strong>{EXAMPLE_PROFILES.find(p => p.key === activeExample)?.label}</strong> demo — editing any field exits demo mode.</span>
            <button onClick={clearForm} style={s.demoClearBtn}>Clear &amp; fill my own details →</button>
          </div>
        )}
        <h2 style={s.cardTitle}>{formTitle}</h2>
        <p style={s.cardSub}>{formSub}</p>

        <SectionLabel color={accentColor}>
          {mode === "lender" ? "Personal Information" : "About You"}
        </SectionLabel>
        <div style={s.grid}>
          {grouped.personal.map(f => <Field key={f.key} field={f} value={form[f.key]} onChange={handleChange} error={errors[f.key]} accentColor={accentColor} />)}
        </div>

        <SectionLabel color={accentColor}>
          {mode === "lender" ? "Loan Details" : "Loan Details"}
        </SectionLabel>
        <div style={s.grid}>
          {grouped.loan.map(f => <Field key={f.key} field={f} value={form[f.key]} onChange={handleChange} error={errors[f.key]} accentColor={accentColor} />)}
        </div>

        <SectionLabel color={accentColor}>
          {mode === "lender" ? "Credit History" : "Your Credit History"}
        </SectionLabel>
        <div style={s.grid}>
          {grouped.credit.map(f => <Field key={f.key} field={f} value={form[f.key]} onChange={handleChange} error={errors[f.key]} accentColor={accentColor} />)}
        </div>

        {Object.keys(errors).length > 0 && (
          <div style={s.validationBanner}>Fix the highlighted fields before submitting.</div>
        )}

        <button style={{ ...s.btn, background: btnGradient, boxShadow: btnShadow, ...(loading ? s.btnDisabled : {}) }} onClick={handleSubmit} disabled={loading}>
          {loading ? "Analyzing..." : submitLabel}
        </button>

        {error && (
          <div style={s.errorBox}>
            <strong>Connection error:</strong> {error}
            <div style={{ fontSize: 12, marginTop: 4, opacity: 0.8 }}>Make sure the backend is running at {API_URL}</div>
          </div>
        )}
      </div>

      {/* Results */}
      {result && riskCfg && (
        <div style={s.card}>
          <div style={s.tabs}>
            {tabs.map(([id, label]) => (
              <button key={id} style={{ ...s.tab, ...(activeTab === id ? { color: accentColor, borderBottomColor: accentColor } : {}) }} onClick={() => setActiveTab(id)}>
                {label}
              </button>
            ))}
            {whatIfLoading && <span style={s.liveTag}>● live</span>}
          </div>

          {/* Result Tab */}
          {activeTab === "result" && (
            <div style={s.resultLayout}>
              <div style={s.gaugeCol}>
                <RiskGauge probability={result.default_probability} riskCfg={riskCfg} />
                <div style={{ textAlign: "center", marginTop: 6 }}>
                  <span style={{ ...s.riskPill, background: riskCfg.gradient }}>
                    {riskCfg.icon} {mode === "borrower" ? riskCfg.borrowerLabel : riskCfg.label}
                  </span>
                </div>
              </div>
              <div style={s.resultCol}>
                <p style={s.riskMsg}>
                  {mode === "borrower" ? riskCfg.borrowerMsg : result.message}
                </p>
                <div style={s.statsGrid}>
                  {mode === "lender" ? (
                    <>
                      <StatBox label="Default Probability" value={`${(result.default_probability * 100).toFixed(1)}%`} color={riskCfg.color} />
                      <StatBox label="Model Confidence"    value={result.confidence}                                    color={riskCfg.color} />
                      <StatBox label="Base Rate"           value={`${(result.base_probability * 100).toFixed(1)}%`}    color="#64748b"       />
                      <StatBox label="Risk Level"          value={result.risk_level}                                    color={riskCfg.color} />
                    </>
                  ) : (
                    <>
                      <StatBox
                        label="Approval Chances"
                        value={result.risk_level === "Low" ? "Good ✓" : result.risk_level === "Medium" ? "Fair —" : "Low ✕"}
                        color={riskCfg.color}
                        hint={result.risk_level === "Low" ? "Most lenders would approve this" : result.risk_level === "Medium" ? "Some lenders may approve with conditions" : "Most lenders would likely decline this"}
                      />
                      <StatBox
                        label="How Sure Are We?"
                        value={result.confidence === "High" ? "Very Sure" : result.confidence === "Medium" ? "Fairly Sure" : "Less Certain"}
                        color={riskCfg.color}
                        hint="Based on how similar your profile is to our training data"
                      />
                      <StatBox
                        label="Out of 100 Similar Applicants"
                        value={`~${Math.round(result.default_probability * 100)} struggled`}
                        color={riskCfg.color}
                        hint="This many people with a similar profile had trouble repaying"
                      />
                      <StatBox
                        label="Your Profile Strength"
                        value={result.risk_level === "Low" ? "Strong" : result.risk_level === "Medium" ? "Average" : "Needs Work"}
                        color={riskCfg.color}
                        hint="Based on income, credit history, loan size and other factors"
                      />
                    </>
                  )}
                </div>
                <ImprovementSuggestions shapValues={result.shap_values} riskLevel={result.risk_level} mode={mode} />
              </div>
            </div>
          )}

          {/* Explain Tab */}
          {activeTab === "explain" && (
            <div>
              {mode === "lender" ? (
                <>
                  <p style={s.explainNote}>
                    Each bar shows how much a factor <span style={{ color: "#ef4444", fontWeight: 600 }}>increases</span> or <span style={{ color: "#10b981", fontWeight: 600 }}>decreases</span> the default probability. Sorted by impact.
                  </p>
                  <ResponsiveContainer width="100%" height={360}>
                    <BarChart data={result.shap_values.slice(0, 10)} layout="vertical" margin={{ left: 150, right: 40, top: 8, bottom: 8 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                      <XAxis type="number" tickFormatter={v => v.toFixed(2)} fontSize={11} tick={{ fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                      <YAxis type="category" dataKey="label" width={145} fontSize={12} tick={{ fill: "#475569" }} axisLine={false} tickLine={false} />
                      <Tooltip formatter={(v, _, p) => [`${p.payload.shap_value > 0 ? "+" : ""}${p.payload.shap_value.toFixed(4)}`, "Impact"]}
                        contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 13 }} />
                      <ReferenceLine x={0} stroke="#cbd5e1" strokeWidth={1.5} />
                      <Bar dataKey="shap_value" radius={[0, 4, 4, 0]} maxBarSize={24}>
                        {result.shap_values.slice(0, 10).map((entry, i) => (
                          <Cell key={i} fill={entry.direction === "increases_risk" ? "#ef4444" : "#10b981"} fillOpacity={0.85} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                  <ImprovementSuggestions shapValues={result.shap_values} riskLevel={result.risk_level} mode={mode} />
                </>
              ) : (
                <BorrowerExplain shapValues={result.shap_values} riskLevel={result.risk_level} />
              )}
            </div>
          )}

          {/* What-if Tab */}
          {activeTab === "whatif" && whatIf && (
            <div>
              <p style={s.explainNote}>
                {mode === "lender"
                  ? "Adjust values to simulate different scenarios and see how they affect the risk score."
                  : "See how changing your financial details would affect your approval chances."}
              </p>
              <div style={s.whatIfLayout}>
                <div style={s.slidersCol}>
                  {WHATIF_FIELDS.map(f => (
                    <div key={f.key} style={s.sliderRow}>
                      <div style={s.sliderTop}>
                        <span style={s.sliderLabel}>{f.label}</span>
                        <span style={{ ...s.sliderVal, color: accentColor }}>
                          {f.step < 1 ? parseFloat(whatIf[f.key]).toFixed(2) : Math.round(whatIf[f.key]).toLocaleString()}
                        </span>
                      </div>
                      <input type="range" min={f.min} max={f.max} step={f.step}
                        value={whatIf[f.key]} onChange={e => handleWhatIfChange(f.key, e.target.value)}
                        style={{ ...s.slider, accentColor }} />
                      <div style={s.sliderEnds}><span>{f.min}</span><span>{f.max}</span></div>
                    </div>
                  ))}
                </div>
                <div style={s.whatIfGauge}>
                  <RiskGauge probability={result.default_probability} riskCfg={riskCfg} />
                  <div style={{ textAlign: "center", marginTop: 8 }}>
                    <span style={{ ...s.riskPill, background: riskCfg.gradient }}>
                      {riskCfg.icon} {mode === "borrower" ? riskCfg.borrowerLabel : riskCfg.label}
                    </span>
                  </div>
                  <div style={{ textAlign: "center", marginTop: 12 }}>
                    <div style={{ fontSize: 11, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                      {mode === "borrower" ? "Approval Chances" : "Default Probability"}
                    </div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: riskCfg.color, marginTop: 4 }}>
                      {mode === "borrower"
                        ? (result.risk_level === "Low" ? "Good ✓" : result.risk_level === "Medium" ? "Fair —" : "Low ✕")
                        : `${(result.default_probability * 100).toFixed(1)}%`}
                    </div>
                    <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>
                      {mode === "borrower"
                        ? (result.risk_level === "Low" ? "Most lenders would approve" : result.risk_level === "Medium" ? "Some lenders may approve" : "Most lenders would decline")
                        : `Confidence: ${result.confidence}`}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Model methodology — bottom, collapsed by default, lender only */}
      {mode === "lender" && <ModelComparisonCard />}
    </div>
  );
}

export default function App() {
  const [mode, setMode] = useState("lender");

  return (
    <div style={s.root}>
      {/* Header */}
      <header style={s.header}>
        <div style={s.headerInner}>
          <div style={s.headerTop}>
            <div style={s.logo}>
              <span style={s.logoMark}>◈</span>
              <span style={s.logoText}>LoanLens</span>
              <span style={s.logoBadge}>AI-Powered</span>
            </div>
          </div>
          <p style={s.tagline}>Loan Risk Assessment · Explainable AI · What-if Simulator</p>
        </div>
      </header>

      {/* Mode Toggle */}
      <div style={s.toggleWrap}>
        <div style={s.toggleInner}>
          <div style={s.toggleTrack}>
            <button
              style={{ ...s.toggleBtn, ...(mode === "lender" ? s.toggleBtnActive("#2563eb") : {}) }}
              onClick={() => setMode("lender")}
            >
              🏦 I'm a Lender
            </button>
            <button
              style={{ ...s.toggleBtn, ...(mode === "borrower" ? s.toggleBtnActive("#7c3aed") : {}) }}
              onClick={() => setMode("borrower")}
            >
              👤 I'm a Borrower
            </button>
          </div>
          <p style={s.toggleHint}>
            {mode === "lender"
              ? "Assess applicant risk and get explainable AI-driven credit decisions"
              : "Check your loan eligibility and see how to improve your approval chances"}
          </p>
        </div>
      </div>

      <main style={s.main}>
        <FormPage key={mode} mode={mode} />
      </main>

      <footer style={s.footer}>
        {["XGBoost","SHAP","FastAPI","React"].map(t => <span key={t} style={s.footerBadge}>{t}</span>)}
        <span style={{ marginLeft: 16, color: "#94a3b8", fontSize: 12 }}>LoanLens © 2025</span>
      </footer>
    </div>
  );
}

function SectionLabel({ children, color }) {
  return <div style={{ ...s.sectionLabel, borderBottomColor: `${color}22` }}>{children}</div>;
}

function Field({ field, value, onChange, error, accentColor }) {
  const inputStyle = { ...s.input, ...(error ? s.inputError : {}) };
  return (
    <div style={s.fieldWrap}>
      <label style={s.label}>{field.label}</label>
      {field.type === "select"
        ? <select name={field.key} value={value} onChange={onChange} style={inputStyle}>
            {field.options.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        : <input type="number" name={field.key} value={value} onChange={onChange}
            min={field.min} max={field.max} step={field.step || "1"} style={inputStyle} />
      }
      {error && <span style={s.fieldError}>{error}</span>}
    </div>
  );
}

function BorrowerExplain({ shapValues, riskLevel }) {
  const PLAIN_ENGLISH = {
    "loan_grade":                { good: "Your credit grade is strong — lenders trust you more.", bad: "Your credit grade is low (D–G). This is one of the biggest things hurting your chances." },
    "loan_int_rate":             { good: "Your interest rate is reasonable — not a red flag for lenders.", bad: "Your interest rate is high. This signals that lenders already see you as risky." },
    "person_income":             { good: "Your income is a positive factor — you can afford this loan.", bad: "Your income is on the lower side relative to this loan." },
    "loan_amnt":                 { good: "The loan amount looks manageable for your profile.", bad: "The loan amount is high relative to your financial profile." },
    "loan_percent_income":       { good: "Your loan repayment won't eat up too much of your income.", bad: "The loan repayment would take up a large chunk of your income each month." },
    "loan_to_income_ratio":      { good: "Good balance between what you earn and what you're borrowing.", bad: "You're borrowing a lot compared to your income. Try reducing the loan amount." },
    "person_emp_length":         { good: "Your employment history shows stability — lenders like this.", bad: "You haven't been employed very long. More job stability would help." },
    "cb_person_default_on_file": { good: "No past defaults — this is a strong positive signal.", bad: "A previous default is on your record. This is one of the hardest things to overcome quickly." },
    "cb_person_cred_hist_length":{ good: "You have a decent credit history — lenders can assess you better.", bad: "Your credit history is short. Keep using credit responsibly to build it up." },
    "person_age":                { good: "Your age isn't a significant factor here.", bad: "Younger applicants have less credit track record — this adds some uncertainty." },
    "loan_intent":               { good: "Your loan purpose (education/medical/personal) is viewed favorably.", bad: "Venture loans carry more risk in lenders' eyes — they're harder to get approved." },
    "int_rate_x_loan_grade":     { good: "Your rate and grade combination looks reasonable.", bad: "The combination of your credit grade and interest rate is raising red flags." },
  };

  const helping  = shapValues.filter(s => s.direction === "decreases_risk").slice(0, 4);
  const hurting  = shapValues.filter(s => s.direction === "increases_risk").slice(0, 4);

  return (
    <div>
      <p style={s.explainNote}>Here's a plain breakdown of what's working for you and what's working against you.</p>

      <div style={be.section}>
        <div style={be.sectionTitle("#10b981")}>✓ Working in your favor</div>
        {helping.length === 0
          ? <div style={be.empty}>Nothing significant is helping right now.</div>
          : helping.map((item, i) => (
            <div key={i} style={be.card("#10b981")}>
              <span style={be.cardIcon("#10b981")}>✓</span>
              <div>
                <div style={be.cardLabel}>{item.label}</div>
                <div style={be.cardText}>{PLAIN_ENGLISH[item.feature]?.good || `${item.label} is helping your application.`}</div>
              </div>
            </div>
          ))
        }
      </div>

      <div style={{ ...be.section, marginTop: 20 }}>
        <div style={be.sectionTitle("#ef4444")}>✕ Working against you</div>
        {hurting.length === 0
          ? <div style={be.empty}>Nothing significant is hurting right now.</div>
          : hurting.map((item, i) => (
            <div key={i} style={be.card("#ef4444")}>
              <span style={be.cardIcon("#ef4444")}>✕</span>
              <div>
                <div style={be.cardLabel}>{item.label}</div>
                <div style={be.cardText}>{PLAIN_ENGLISH[item.feature]?.bad || `${item.label} is hurting your application.`}</div>
              </div>
            </div>
          ))
        }
      </div>

      {riskLevel !== "Low" && (
        <ImprovementSuggestions shapValues={shapValues} riskLevel={riskLevel} mode="borrower" />
      )}
    </div>
  );
}

const be = {
  section:      {},
  sectionTitle: (color) => ({ fontSize: 13, fontWeight: 700, color, marginBottom: 10 }),
  empty:        { fontSize: 13, color: "#94a3b8" },
  card:         (color) => ({ display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 14px", background: `${color}08`, border: `1px solid ${color}22`, borderRadius: 8, marginBottom: 8 }),
  cardIcon:     (color) => ({ fontSize: 14, fontWeight: 700, color, flexShrink: 0, marginTop: 1 }),
  cardLabel:    { fontSize: 13, fontWeight: 600, color: "#1e293b", marginBottom: 2 },
  cardText:     { fontSize: 13, color: "#475569", lineHeight: 1.5 },
};

function StatBox({ label, value, color, hint }) {
  return (
    <div style={s.statBox}>
      <div style={{ fontSize: 20, fontWeight: 800, color, letterSpacing: "-0.5px" }}>{value}</div>
      <div style={{ fontSize: 11, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", marginTop: 2 }}>{label}</div>
      {hint && <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 6, lineHeight: 1.4, fontStyle: "italic" }}>{hint}</div>}
    </div>
  );
}

const s = {
  root:            { fontFamily: "'Inter',-apple-system,BlinkMacSystemFont,sans-serif", background: "#f1f5f9", minHeight: "100vh", color: "#1e293b" },
  header:          { background: "linear-gradient(135deg,#0f172a 0%,#1e293b 100%)", padding: "20px 0" },
  headerInner:     { maxWidth: 960, margin: "0 auto", padding: "0 24px" },
  headerTop:       { display: "flex", alignItems: "center", marginBottom: 4 },
  logo:            { display: "flex", alignItems: "center", gap: 8 },
  logoMark:        { fontSize: 22, color: "#60a5fa" },
  logoText:        { fontSize: 20, fontWeight: 800, color: "#f8fafc", letterSpacing: "-0.5px" },
  logoBadge:       { fontSize: 10, fontWeight: 700, color: "#60a5fa", background: "rgba(96,165,250,0.12)", border: "1px solid rgba(96,165,250,0.25)", borderRadius: 4, padding: "2px 8px", letterSpacing: "0.06em", textTransform: "uppercase", marginLeft: 10 },
  tagline:         { fontSize: 12, color: "#475569" },
  toggleWrap:      { background: "#fff", borderBottom: "1px solid #e2e8f0" },
  toggleInner:     { maxWidth: 960, margin: "0 auto", padding: "16px 24px", display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" },
  toggleTrack:     { display: "flex", background: "#f1f5f9", borderRadius: 10, padding: 4, gap: 4 },
  toggleBtn:       { padding: "9px 20px", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, color: "#64748b", background: "none", cursor: "pointer", transition: "all 0.2s" },
  toggleBtnActive: (color) => ({ background: color, color: "#fff", boxShadow: `0 2px 8px ${color}40` }),
  toggleHint:      { fontSize: 13, color: "#64748b", flex: 1 },
  main:            { maxWidth: 960, margin: "0 auto", padding: "24px 24px", display: "flex", flexDirection: "column", gap: 20 },
  scenariosCard:   { background: "#fff", borderRadius: 14, padding: "20px 24px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" },
  scenariosHeader: { marginBottom: 14 },
  scenariosTitle:  { fontSize: 13, fontWeight: 700, color: "#0f172a", display: "block" },
  scenariosSub:    { fontSize: 12, color: "#94a3b8", marginTop: 2, display: "block" },
  scenariosGrid:   { display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: 12 },
  scenarioBtn:     { display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", borderRadius: 10, cursor: "pointer", textAlign: "left", transition: "all 0.15s", width: "100%" },
  scenarioDot:     { width: 10, height: 10, borderRadius: "50%", flexShrink: 0 },
  scenarioText:    { flex: 1 },
  scenarioLabel:   { fontSize: 13, fontWeight: 700 },
  scenarioDesc:    { fontSize: 12, color: "#64748b", marginTop: 2 },
  scenarioArrow:   { fontSize: 16, fontWeight: 700, opacity: 0.6 },
  modelToggle:     { display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", background: "none", border: "none", cursor: "pointer", padding: 0, textAlign: "left" },
  modelRow:        { marginBottom: 14 },
  modelRowTop:     { display: "flex", justifyContent: "space-between", marginBottom: 5 },
  modelBarTrack:   { height: 8, background: "#f1f5f9", borderRadius: 99, overflow: "hidden" },
  modelBarFill:    { height: "100%", borderRadius: 99, transition: "width 0.5s ease" },
  selectedBadge:   { fontSize: 10, fontWeight: 700, color: "#2563eb", background: "rgba(37,99,235,0.1)", borderRadius: 4, padding: "2px 6px", marginLeft: 6 },
  modelNote:       { fontSize: 12, color: "#94a3b8", lineHeight: 1.6, marginTop: 14, paddingTop: 14, borderTop: "1px solid #f1f5f9" },
  card:            { background: "#fff", borderRadius: 14, padding: "28px 32px", boxShadow: "0 1px 3px rgba(0,0,0,0.06),0 8px 24px rgba(0,0,0,0.04)" },
  demoBanner:      { display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10, background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, padding: "10px 14px", marginBottom: 16, fontSize: 13, color: "#475569" },
  demoClearBtn:    { fontSize: 12, fontWeight: 700, color: "#2563eb", background: "none", border: "1px solid #bfdbfe", borderRadius: 6, padding: "5px 12px", cursor: "pointer" },
  cardTitle:       { fontSize: 18, fontWeight: 700, color: "#0f172a", margin: "0 0 4px" },
  cardSub:         { fontSize: 13, color: "#64748b", margin: "0 0 4px", lineHeight: 1.5 },
  sectionLabel:    { fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#cbd5e1", borderBottom: "1px solid #f1f5f9", paddingBottom: 8, marginBottom: 14, marginTop: 22 },
  grid:            { display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(210px,1fr))", gap: "14px 18px" },
  fieldWrap:       { display: "flex", flexDirection: "column", gap: 4 },
  label:           { fontSize: 12, fontWeight: 600, color: "#64748b" },
  input:           { padding: "9px 12px", borderRadius: 8, border: "1.5px solid #e2e8f0", fontSize: 14, color: "#0f172a", background: "#fff", outline: "none", width: "100%", boxSizing: "border-box" },
  inputError:      { border: "1.5px solid #ef4444", background: "#fef2f2" },
  fieldError:      { fontSize: 11, color: "#ef4444" },
  validationBanner:{ marginTop: 16, padding: "10px 14px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, fontSize: 12, color: "#dc2626", fontWeight: 500 },
  btn:             { marginTop: 20, width: "100%", padding: 13, color: "#fff", border: "none", borderRadius: 9, fontSize: 15, fontWeight: 700, cursor: "pointer" },
  btnDisabled:     { background: "#93c5fd !important", cursor: "not-allowed", opacity: 0.7 },
  errorBox:        { marginTop: 14, padding: "12px 16px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, fontSize: 13, color: "#dc2626" },
  tabs:            { display: "flex", alignItems: "center", gap: 4, marginBottom: 24, borderBottom: "1.5px solid #f1f5f9" },
  tab:             { padding: "9px 18px", border: "none", background: "none", fontSize: 13, fontWeight: 600, color: "#94a3b8", cursor: "pointer", borderBottom: "2px solid transparent", marginBottom: -1.5 },
  liveTag:         { marginLeft: "auto", fontSize: 11, color: "#10b981", fontWeight: 700 },
  resultLayout:    { display: "flex", gap: 32, alignItems: "flex-start", flexWrap: "wrap" },
  gaugeCol:        { flexShrink: 0, width: 220 },
  resultCol:       { flex: 1, minWidth: 260 },
  riskPill:        { display: "inline-block", padding: "5px 14px", borderRadius: 99, fontSize: 12, fontWeight: 700, color: "#fff" },
  riskMsg:         { fontSize: 14, color: "#475569", lineHeight: 1.6, marginBottom: 18 },
  statsGrid:       { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },
  statBox:         { background: "#f8fafc", borderRadius: 10, padding: "14px 16px", border: "1px solid #f1f5f9" },
  explainNote:     { fontSize: 13, color: "#64748b", marginBottom: 16, lineHeight: 1.6 },
  whatIfLayout:    { display: "flex", gap: 32, alignItems: "flex-start", flexWrap: "wrap" },
  slidersCol:      { flex: 1, minWidth: 260 },
  whatIfGauge:     { width: 220, flexShrink: 0 },
  sliderRow:       { marginBottom: 18 },
  sliderTop:       { display: "flex", justifyContent: "space-between", marginBottom: 6 },
  sliderLabel:     { fontSize: 13, fontWeight: 500, color: "#475569" },
  sliderVal:       { fontSize: 13, fontWeight: 700 },
  slider:          { width: "100%", cursor: "pointer" },
  sliderEnds:      { display: "flex", justifyContent: "space-between", fontSize: 10, color: "#cbd5e1", marginTop: 3 },
  footer:          { maxWidth: 960, margin: "0 auto", padding: "16px 24px 32px", display: "flex", alignItems: "center", gap: 8 },
  footerBadge:     { fontSize: 11, fontWeight: 600, color: "#64748b", background: "#f1f5f9", border: "1px solid #e2e8f0", borderRadius: 5, padding: "3px 8px" },
};
