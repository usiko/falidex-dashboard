export interface IAppConfig {
	urls: {
		dataServer: string;
		pictureServer: string;
	};
    paths: {
		circulaires: string;
		circulaireColors: string;
		symbols: string;
		symbolSens: string;
		symbolAccessories: string;
		significations: string;
		filieres: string;
		placements: string;
		positions: string;
		colors: string;
		dataLink: string;
		dataLinkItem: string;
		token: string;
        login:string;
	};
    pictureServerSalt: string;
}