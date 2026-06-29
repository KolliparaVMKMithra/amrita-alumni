"use client";
import { Mail, Phone, Code2 } from "lucide-react";

export default function Footer() {
  return (
    <footer style={{
      background: "var(--bg-secondary)",
      borderTop: "1px solid var(--border-color)",
      padding: "3rem 2rem 2rem",
      color: "var(--text-secondary)",
      fontSize: "0.88rem",
      marginTop: "auto",
      width: "100%"
    }}>
      <div style={{
        maxWidth: 1200,
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        gap: "2.5rem"
      }}>
        {/* Upper footer */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "2rem",
          alignItems: "start"
        }}>
          {/* Developed By info */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              color: "var(--maroon)",
              fontWeight: 800,
              fontSize: "1.1rem",
              fontFamily: "Montserrat"
            }}>
              <Code2 size={20} />
              Chakravyuha Club
            </div>
            <p style={{ lineHeight: 1.6, fontSize: "0.82rem", color: "var(--text-secondary)" }}>
              A technical innovation hub of Amrita Vishwa Vidyapeetham, Amaravati. Empowering students, shaping careers, and fostering alumni connections.
            </p>
          </div>

          {/* Contact Details List */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <h4 style={{
              fontSize: "0.85rem",
              textTransform: "uppercase",
              letterSpacing: "1px",
              color: "var(--text-primary)",
              fontWeight: 800,
              fontFamily: "Montserrat",
              marginBottom: "0.25rem"
    
            }}>
              Club Developers & Administrators
            </h4>

            {/* B Sree Krishna */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
              <div style={{ fontWeight: 700, color: "var(--text-primary)" }}>B Sree Krishna</div>
              <div style={{ fontSize: "0.78rem", color: "var(--text-secondary)" }}>General Manager, CIR Dept (Amrita Amaravati)</div>
              <div style={{ display: "flex", gap: "1rem", fontSize: "0.78rem", marginTop: 2 }}>
                <a href="mailto:b_sreekrishna@av.amrita.edu" style={{ display: "flex", alignItems: "center", gap: 4, color: "var(--maroon)", textDecoration: "none", fontWeight: 600 }}>
                  <Mail size={12} /> b_sreekrishna@av.amrita.edu
                </a>
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <Phone size={12} /> 8555831697
                </span>
              </div>
            </div>
          </div>

          {/* Core Developers */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "1.4rem" }}>
            {/* Kollipara VMK Mithra */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
              <div style={{ fontWeight: 700, color: "var(--text-primary)" }}>Kollipara VMK Mithra</div>
              <div style={{ display: "flex", gap: "1rem", fontSize: "0.78rem" }}>
                <a href="mailto:kolliparamithra84@gmail.com" style={{ display: "flex", alignItems: "center", gap: 4, color: "var(--maroon)", textDecoration: "none", fontWeight: 600 }}>
                  <Mail size={12} /> kolliparamithra84@gmail.com
                </a>
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <Phone size={12} /> 7032069306
                </span>
              </div>
            </div>

            {/* Palisetty Rudrabhishek */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
              <div style={{ fontWeight: 700, color: "var(--text-primary)" }}>Palisetty Rudrabhishek</div>
              <div style={{ display: "flex", gap: "1rem", fontSize: "0.78rem" }}>
                <a href="mailto:rudrabhishekpalisetty2005@gmail.com" style={{ display: "flex", alignItems: "center", gap: 4, color: "var(--maroon)", textDecoration: "none", fontWeight: 600 }}>
                  <Mail size={12} /> rudrabhishekpalisetty2005@gmail.com
                </a>
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <Phone size={12} /> 8985060639
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Lower footer copyright */}
        <div style={{
          borderTop: "1px solid var(--border-color)",
          paddingTop: "1.5rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem",
          fontSize: "0.78rem"
        }}>
          <div>
            &copy; {new Date().getFullYear()} Amrita Vishwa Vidyapeetham, Amaravati. All rights reserved.
          </div>
          <div style={{ display: "flex", gap: "1.5rem" }}>
            <span style={{ fontWeight: 600 }}>Developed by Chakravyuha Club</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
