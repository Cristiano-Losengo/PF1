import { useState } from "react";
import { Link } from "react-router-dom";
import { FaClinicMedical } from "react-icons/fa";

function SubmenuSaude() {
  const [open, setOpen] = useState(false);

  return (
    <li
      className="dropdown"
      onMouseEnter={() => setOpen(true)}   // abre ao passar o mouse
      onMouseLeave={() => setOpen(false)} // fecha ao sair com o mouse
    >
      <Link
        className="dropdown-item dropdown-toggle d-flex align-items-center"
        to="#"
        role="button"
        onClick={(e) => {
          e.preventDefault(); // evita reload
          setOpen(!open);     // toggle ao clicar
        }}
      >
        <FaClinicMedical className="me-2 text-primary" /> Centros de Saúde
      </Link>

      {open && (
        <ul className="dropdown-menu show shadow-sm border-0 animate__animated animate__fadeIn">
          <li>
            <Link
              className="dropdown-item d-flex align-items-center"
              to="/saude/centro_saude/maternidade"
            >
              Cadastrar
            </Link>
          </li>
          <li>
            <Link
              className="dropdown-item d-flex align-items-center"
              to="/saude/centro_saude/pediatria"
            >
               Listar
            </Link>
          </li>
          <li>
            
          </li>
        </ul>
      )}
    </li>
  );
}

export default SubmenuSaude;
