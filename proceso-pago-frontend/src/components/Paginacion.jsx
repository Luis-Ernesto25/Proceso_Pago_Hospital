import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination"

import { Input } from "@/components/ui/input"
import { useState } from "react";

export default function Paginacion({ paginaActual, totalPaginas, onCambiarPagina }) {
    
    const [paginaInput, setPaginaInput] = useState("");

    const handleInputChange = (e) => {
        // Solo permitir números
        const valor = e.target.value.replace(/[^0-9]/g, '');
        setPaginaInput(valor);
    };

    const handleInputEnter = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            
            const numeroPagina = parseInt(paginaInput);
            
            // Validar que sea un número válido dentro del rango
            if (!isNaN(numeroPagina) && numeroPagina >= 1 && numeroPagina <= totalPaginas) {
                onCambiarPagina(numeroPagina);
                setPaginaInput(""); // Limpiar input después de navegar
            } else if (paginaInput.trim() === "") {
                console.log("Por favor ingrese un número de página");
            } else {
                console.log(`Ingrese un número entre 1 y ${totalPaginas}`);
            }
        }
    };

    // Función para generar números de página (con elipsis para muchas páginas)
    const generarPaginas = () => {
        const paginas = [];
        const maxPaginasVisibles = 5;
        
        if (totalPaginas <= maxPaginasVisibles) {
            // Mostrar todas las páginas
            for (let i = 1; i <= totalPaginas; i++) {
                paginas.push(i);
            }
        } else {
            // Mostrar páginas con elipsis
            if (paginaActual <= 3) {
                paginas.push(1, 2, 3, 4, '...', totalPaginas);
            } else if (paginaActual >= totalPaginas - 2) {
                paginas.push(1, '...', totalPaginas - 3, totalPaginas - 2, totalPaginas - 1, totalPaginas);
            } else {
                paginas.push(1, '...', paginaActual - 1, paginaActual, paginaActual + 1, '...', totalPaginas);
            }
        }
        
        return paginas;
    };

    return (
        <div className="p-2 border-t">
            <Pagination>
                <PaginationContent className="flex items-center gap-2">
                    <PaginationItem>
                        <PaginationPrevious
                            href="#"
                            onClick={(e) => {
                                e.preventDefault();
                                if (paginaActual > 1) onCambiarPagina(paginaActual - 1);
                            }}
                            className={paginaActual === 1 ? "pointer-events-none opacity-50" : ""}
                        />
                    </PaginationItem>
                    
                    {generarPaginas().map((pagina, index) => (
                        <PaginationItem key={index}>
                            {pagina === '...' ? (
                                <span className="px-2">...</span>
                            ) : (
                                <PaginationLink
                                    href="#"
                                    isActive={pagina === paginaActual}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        onCambiarPagina(pagina);
                                    }}
                                >
                                    {pagina}
                                </PaginationLink>
                            )}
                        </PaginationItem>
                    ))}
                    
                    <PaginationItem>
                        <PaginationNext
                            href="#"
                            onClick={(e) => {
                                e.preventDefault();
                                if (paginaActual < totalPaginas) onCambiarPagina(paginaActual + 1);
                            }}
                            className={paginaActual === totalPaginas ? "pointer-events-none opacity-50" : ""}
                        />
                    </PaginationItem>
                    
                    {/* Input al lado de la paginación */}
                    <PaginationItem className="ml-4">
                        <Input
                            placeholder="Página"
                            value={paginaInput}
                            onChange={handleInputChange}
                            onKeyDown={handleInputEnter}
                            className="w-20 text-center h-8"
                            type="text"
                            inputMode="numeric"
                        />
                    </PaginationItem>
                </PaginationContent>
            </Pagination>
        </div>
    );
}