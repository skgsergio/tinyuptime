import React from "react";

import { MainContainer } from "@/components/MainContainer";

export default function Home() {
  return (
    <MainContainer>
      <h1 className="text-4xl font-bold mb-4 text-white">
        Tinyuptime no esta disponible
      </h1>

      <div className="text-2xl mb-6">
        Por tiempo indefinido (permanentemente posiblemente), Tinyuptime no
        estará disponible.
      </div>

      <div className="text-2xl mb-6">
        Recomiendo el sitio{" "}
        <a
          href="https://hayahora.futbol"
          className="font-bold text-blue-400 hover:underline hover:text-blue-300"
        >
          https://hayahora.futbol
        </a>{" "}
        como alternativa para monitorizar los bloqueos de LaLiga.
      </div>
    </MainContainer>
  );
}
