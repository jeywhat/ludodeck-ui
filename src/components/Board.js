import React, { useState, useEffect } from "react";
import { DndContext, useDraggable, useDroppable, DragOverlay } from "@dnd-kit/core";

function DraggableCard({ item, index, columnId, onIncrease, onDecrease, cardStyle, children }) {
    const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
        id: `${columnId}-${item.id}`,
        data: { itemId: item.id, fromColumnId: columnId, index },
    });
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div
            ref={setNodeRef}
            {...attributes}
            {...listeners}
            title={item.effect} // Affiche l'effet en tooltip natif
            style={{
                padding: 20,
                margin: "0 0 10px 0",
                background: isDragging ? "#dbeafe" : "#fff",
                borderRadius: "10px",
                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "space-between",
                fontSize: "1.2rem",
                fontWeight: "bold",
                textAlign: "center",
                color: "#333",
                opacity: isDragging ? 0.7 : 1,
                cursor: "grab",
                transition: "transform 0.15s, opacity 0.15s",
                ...cardStyle,
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <img
                src="https://www.relations-publiques.pro/wp-content/uploads/2023/07/DINDON-DE-LA-FARCE.jpg"
                alt={item.name}
                style={{
                    width: cardStyle?.width || "100%",
                    height: cardStyle?.height || "150px",
                    objectFit: "cover",
                    borderRadius: "10px",
                }}
            />
            {/* Affiche le nom et la quantité seulement si pas en mode deck */}
            {cardStyle && isHovered && (
                <>
                    <button
                        onPointerDown={e => e.stopPropagation()}
                        onTouchStart={e => e.stopPropagation()}
                        onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            onDecrease && onDecrease("hand", item.id);
                        }}
                        style={{
                            position: "absolute",
                            top: 8,
                            left: 8,
                            zIndex: 10,
                            background: "#f44336",
                            color: "#fff",
                            border: "none",
                            borderRadius: "50%",
                            width: 32,
                            height: 32,
                            fontSize: "1.5rem",
                            cursor: "pointer",
                            boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                        }}
                        aria-label="Retirer du deck"
                    >
                        -
                    </button>
                    <button
                        onPointerDown={e => e.stopPropagation()}
                        onTouchStart={e => e.stopPropagation()}
                        onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            onIncrease && onIncrease("hand", item.id);
                        }}
                        style={{
                            position: "absolute",
                            top: 8,
                            right: 8,
                            zIndex: 10,
                            background: "#4caf50",
                            color: "#fff",
                            border: "none",
                            borderRadius: "50%",
                            width: 32,
                            height: 32,
                            fontSize: "1.5rem",
                            cursor: "pointer",
                            boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                        }}
                        aria-label="Ajouter à la main"
                    >
                        +
                    </button>
                </>
            )}
            {children}
        </div>
    );
}

function DroppableColumn({ columnId, column, children, style }) {
    const { setNodeRef, isOver: over } = useDroppable({ id: columnId });
    return (
        <div
            ref={setNodeRef}
            style={{
                padding: 20,
                minHeight: 500,
                background: over ? "#e0e7ff" : "#f4f4f4",
                borderRadius: "10px",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                transition: "background 0.2s",
                ...style,
            }}
        >
            <h2 style={{ textAlign: "center" }}>{column.name}</h2>
            {children}
        </div>
    );
}


function Board() {
    const [columns, setColumns] = useState({
        deck: { name: "Deck", items: [] },
        hand: { name: "Hand", items: [] },
    });
    const [activeCard, setActiveCard] = useState(null);

    useEffect(() => {
        fetch("/deck.json")
            .then((response) => response.json())
            .then((data) => {
                setColumns((prevState) => ({
                    ...prevState,
                    deck: { ...prevState.deck, items: data },
                }));
            });
    }, []);

    const handleDragStart = (event) => {
        const { itemId, fromColumnId } = event.active.data.current;
        const item = columns[fromColumnId].items.find((i) => i.id === itemId);
        setActiveCard(item);
    };

    const handleDragEnd = (event) => {
        setActiveCard(null);
        const { active, over } = event;
        if (!over) return;

        const { itemId, fromColumnId } = active.data.current;
        const toColumnId = over.id;
        if (fromColumnId === toColumnId || toColumnId !== "hand") return;

        const card = columns.deck.items.find((item) => item.id === itemId);
        if (!card) return;

        const handItems = [...columns.hand.items];
        const handCardIndex = handItems.findIndex((item) => item.id === itemId);

        if (handCardIndex !== -1) {
            handItems[handCardIndex] = {
                ...handItems[handCardIndex],
                quantity: handItems[handCardIndex].quantity + 1,
            };
        } else {
            handItems.push({ ...card, quantity: 1 });
        }

        setColumns({
            ...columns,
            hand: { ...columns.hand, items: handItems },
        });
    };

    const increaseQuantity = (columnId, itemId) => {
        const updatedColumns = { ...columns };
        const column = updatedColumns[columnId];
        const item = column.items.find((item) => item.id === itemId);
        if (item) {
            item.quantity += 1;
        } else {
            const card = columns.deck.items.find((item) => item.id === itemId);
            if (card) {
                updatedColumns.hand.items = [...columns.hand.items, { ...card, quantity: 1 }];
            }
        }
        setColumns(updatedColumns);
    };

    const decreaseQuantity = (columnId, itemId) => {
        const updatedColumns = { ...columns };
        const column = updatedColumns[columnId];
        const item = column.items.find((item) => item.id === itemId);
        if (item) {
            if (item.quantity > 1) {
                item.quantity -= 1;
            } else {
                column.items = column.items.filter((i) => i.id !== itemId);
            }
            setColumns(updatedColumns);
        }
    };

    return (
        <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <div style={{ display: "flex", justifyContent: "space-around", padding: 20, gap: 20 }}>
                {/* Deck en grille */}
                <DroppableColumn
                    columnId="deck"
                    column={columns.deck}
                    style={{ flex: 3 }}
                >
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fill, 90px)",
                            gap: "70px",
                            justifyContent: "start",
                        }}
                    >
                        {columns.deck.items.map((item, index) => (
                            <DraggableCard
                                key={item.id}
                                item={item}
                                index={index}
                                columnId="deck"
                                onIncrease={increaseQuantity}
                                onDecrease={decreaseQuantity}
                                cardStyle={{
                                    width: 134,
                                    height: 184,
                                    padding: 0,
                                    margin: 0,
                                    position: "relative",
                                }}
                            >

                            </DraggableCard>
                        ))}
                    </div>
                </DroppableColumn>
                {/* Hand en ligne */}
                <DroppableColumn
                    columnId="hand"
                    column={columns.hand}
                    style={{ flex: 1, minWidth: 220 }}
                >
                    <div
                        style={{
                            maxHeight: 1000,
                            overflowY: "auto",
                        }}
                    >
                        {columns.hand.items.map((item, index) => (
                            <div
                                key={item.id}
                                style={{
                                    position: "relative",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    backgroundImage: `url("https://mkdogames.com/wp-content/uploads/2024/06/MAGICHIEN_MOCKUP_ARTICLE.jpg")`,
                                    backgroundSize: "cover",
                                    backgroundPosition: "center",
                                    borderRadius: "8px",
                                    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                                    marginBottom: 10,
                                    fontSize: "1.1rem",
                                    fontWeight: 500,
                                    minHeight: 80,
                                    overflow: "hidden",
                                }}
                            >
                                <div
                                    style={{
                                        position: "relative",
                                        zIndex: 2,
                                        background: "rgba(255,255,255,0.85)",
                                        borderRadius: 8,
                                        padding: "10px 16px",
                                        display: "flex",
                                        alignItems: "center",
                                        width: "100%",
                                    }}
                                >
                                    <span style={{ flex: 1, textAlign: "left" }}>{item.name}</span>
                                    <button
                                        onClick={() => decreaseQuantity("hand", item.id)}
                                        style={{
                                            padding: "5px 10px",
                                            marginRight: 10,
                                            fontSize: "1rem",
                                            border: "none",
                                            borderRadius: "5px",
                                            backgroundColor: "#f44336",
                                            color: "#fff",
                                            cursor: "pointer",
                                        }}
                                    >
                                        -
                                    </button>
                                    <span style={{ fontWeight: "bold", margin: "0 10px" }}>{item.quantity}</span>
                                    <button
                                        onClick={() => increaseQuantity("hand", item.id)}
                                        style={{
                                            padding: "5px 10px",
                                            marginLeft: 10,
                                            fontSize: "1rem",
                                            border: "none",
                                            borderRadius: "5px",
                                            backgroundColor: "#4caf50",
                                            color: "#fff",
                                            cursor: "pointer",
                                        }}
                                    >
                                        +
                                    </button>
                                </div>
                            </div>
                        ))}
                        <button
                            style={{
                                background: "#8e24aa",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                color: "#fff",
                                border: "none",
                                borderRadius: 8,
                                padding: "10px 16px",
                                fontSize: "1.1rem",
                                fontWeight: 500,
                                cursor: "pointer",
                                marginTop: 32,
                                letterSpacing: 1,
                            }}
                            onClick={() => window.open("https://mkdogames.com/configurateur-de-jeu/", "_blank")}
                        >
                            Aller vers MKDOGAMES
                        </button>
                    </div>
                </DroppableColumn>
            </div>
            <DragOverlay dropAnimation={null}>
                {activeCard ? (
                    <div
                        style={{
                            padding: 0,
                            background: "#fff",
                            borderRadius: "10px",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                            width: 134*2.25,
                            height: 184*2.25,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <img
                            src="https://www.relations-publiques.pro/wp-content/uploads/2023/07/DINDON-DE-LA-FARCE.jpg"
                            alt={activeCard.name}
                            style={{ width: 134*2.25,
                                height: 184*2.25, objectFit: "cover", borderRadius: "10px" }}
                        />
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>
    );
}

export default Board;