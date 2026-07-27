export interface IAppConfig {
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
        occurence:string
		token: string;
        login:string;
        resourceUpload:string;
        resourceRemove:string;
        import:string;
	};
    pictureServerSalt: string;
}