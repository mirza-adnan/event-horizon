import type { ReactNode } from "react";
import { createContext, useContext, useState } from "react";

interface StateContextType {
	activeMenu: boolean;
	setActiveMenu: (value: boolean) => void;
}

const StateContext = createContext<StateContextType | undefined>(undefined);

interface ContextProviderProps {
	children: ReactNode;
}

export const ContextProvider = ({ children }: ContextProviderProps) => {
	const [activeMenu, setActiveMenu] = useState(true);

	return (
		<StateContext.Provider
			value={{
				activeMenu,
				setActiveMenu,
			}}
		>
			{children}
		</StateContext.Provider>
	);
};

export const useStateContext = () => {
	const context = useContext(StateContext);
	if (context === undefined) {
		throw new Error(
			"useStateContext must be used within a ContextProvider"
		);
	}
	return context;
};
