import "./CardData.css";

function CardData(props) {
  // Determinar el color basado en el tipo de transacción
  const getCountClass = (title) => {
    if (
      title.toLowerCase().includes("ingreso") ||
      title.toLowerCase().includes("entrada")
    ) {
      return "green";
    } else if (
      title.toLowerCase().includes("gasto") ||
      title.toLowerCase().includes("salida")
    ) {
      return "red";
    } else {
      return "blue"; // Para saldo actual o total
    }
  };

  const countClass = getCountClass(props.title);

  // Determinar el icono basado en el tipo
  const getIcon = (title) => {
    if (
      title.toLowerCase().includes("ingreso") ||
      title.toLowerCase().includes("entrada")
    ) {
      return "\u2191"; // Flecha hacia arriba
    } else if (
      title.toLowerCase().includes("gasto") ||
      title.toLowerCase().includes("salida")
    ) {
      return "\u2193"; // Flecha hacia abajo
    } else {
      return "\u2194"; // Flecha bidireccional o un icono neutro
    }
  };

  return (
    <div className="card-data">
      <h2 className="title">{props.title}</h2>
      <div className="cash-flow-info">
        <p className="value-info">${props.value}</p>
        <div className="transaction-count">
          <div className={`${countClass}`}>{getIcon(props.title)}</div>
          {props.count} transacciones
        </div>
      </div>
    </div>
  );
}

export default CardData;
