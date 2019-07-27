//This contains the input scheme of the NN as an array
//Each array index cooresponds to the node it should go in
const inputScheme = 
[ 
    null,

    //Periods since cross up between _ and _
    //Periods since cross down between _ and _
    //Which cross is most recent (-1 or 1)
    "crsUbADOSCa0 0",
    "crsDbADOSCa0 0",
    "crsRbADOSCa0 0",

    "crsUbADXRaADX 0",
    "crsDbADXRaADX 0",
    "crsRbADXRaADX 0",

    "crsUbAOa0 0",
    "crsDbAOa0 0",
    "crsRbAOa0 0",

    "crsUAPOba0 0",
    "crsDAPOba0 0",
    "crsRAPOba0 0",

    "crsUbAROON_DownaAROON_Up 0",
    "crsDbAROON_DownaAROON_Up 0",
    "crsRbAROON_DownaAROON_Up 0",

    "crsUbAROON_Downa50 0",
    "crsDbAROON_Downa50 0",
    "crsRbAROON_Downa50 0",

    "crsUbAROON_Upa50 0",
    "crsDbAROON_Upa50 0",
    "crsRbAROON_Upa50 0",

    "crsUbCMOa10pCMOSMA 0",
    "crsDbCMOa10pCMOSMA 0",
    "crsRbCMOa10pCMOSMA 0",

    "crsUbDI_MinusaDI_Plus 0",
    "crsDbDI_MinusaDI_Plus 0",
    "crsRbDI_MinusaDI_Plus 0",

    "crsUbDM_MinusaDM_Plus 0",
    "crsDbDM_MinusaDM_Plus 0",
    "crsRbDM_MinusaDM_Plus 0",

    "crsUbFISHERaFISHER_Signal 0",
    "crsDbFISHERaFISHER_Signal 0",
    "crsRbFISHERaFISHER_Signal 0",

    "crsUbLINREGSLOPEa20pLINREGSLOPESMA 0",
    "crsDbLINREGSLOPEa20pLINREGSLOPESMA 0",
    "crsRbLINREGSLOPEa20pLINREGSLOPESMA 0",

    "crsUbMACDaMACD_Signal 0",
    "crsDbMACDaMACD_Signal 0",
    "crsRbMACDaMACD_Signal 0",

    "crsUbMACDa0 0",
    "crsDbMACDa0 0",
    "crsRbMACDa0 0",

    "crsUbMASSa27 0",
    "crsDbMASSa27 0",
    "crsRbMASSa27 0",

    "crsUbMOMa0 0",
    "crsDbMOMa0 0",
    "crsRbMOMa0 0",

    "crsUbMSW_LeadaMSW_sine 0",
    "crsDbMSW_LeadaMSW_sine 0",
    "crsRbMSW_LeadaMSW_sine 0",

    "crsUbNVIa20pNVIEMA 0",
    "crsDbNVIa20pNVIEMA 0",
    "crsRbNVIa20pNVIEMA 0",

    "crsUbPVIa20pPVIEMA 0",
    "crsDbPVIa20pPVIEMA 0",
    "crsRbPVIa20pPVIEMA 0",

    "crsUbQSTICKa0 0",
    "crsDbQSTICKa0 0",
    "crsRbQSTICKa0 0",

    "crsUbQSTICKa20pQSTICKSMA 0",
    "crsDbQSTICKa20pQSTICKSMA 0",
    "crsRbQSTICKa20pQSTICKSMA 0",

    "crsUbROCa0 0",
    "crsDbROCa0 0",
    "crsRbROCa0 0",

    "crsUbSTOCH_daSTOCH_k 0",
    "crsDbSTOCH_daSTOCH_k 0",
    "crsRbSTOCH_daSTOCH_k 0",

    "crsUbTRIXa9pTRIXEMA 0",
    "crsDbTRIXa9pTRIXEMA 0",
    "crsRbTRIXa9pTRIXEMA 0",

    "crsUbTRIXa0 0",
    "crsDbTRIXa0 0",
    "crsRbTRIXa0 0",

    "crsUbWILLRan50 0",
    "crsDbWILLRan50 0",
    "crsRbWILLRan50 0",

    "crsUbBBANDS_LoweraReal 0",
    "crsDbBBANDS_LoweraReal 0",
    "crsRbBBANDS_LoweraReal 0",

    "crsUbBBANDS_UpperaReal 0",
    "crsDbBBANDS_UpperaReal 0",
    "crsRbBBANDS_UpperaReal 0",

    "crsUb21pDEMAa55pDEMA 0",
    "crsDb21pDEMAa55pDEMA 0",
    "crsRb21pDEMAa55pDEMA 0",

    "crsUb15pDEMAa21pDEMA 0",
    "crsDb15pDEMAa21pDEMA 0",
    "crsRb15pDEMAa21pDEMA 0",

    "crsUb15pDEMAa55pDEMA 0",
    "crsDb15pDEMAa55pDEMA 0",
    "crsRb15pDEMAa55pDEMA 0",

    "crsUb12pEMAa26pEMA 0",
    "crsDb12pEMAa26pEMA 0",
    "crsRb12pEMAa26pEMA 0",

    "crsUbKAMAaReal 0",
    "crsDbKAMAaReal 0",
    "crsRbKAMAaReal 0",

    "crsUb10pSMAa40pSMA 0",
    "crsDb10pSMAa40pSMA 0",
    "crsRb10pSMAa40pSMA 0",

    "volume 0",
    "priceChange 0", 
    "AD 0", 
    "ADOSC 0", 
    "ADX 0", 
    "ADXR 0", 
    "AO 0", 
    "APO 0", 
    "AROON_Down 0", 
    "AROON_Up 0", 
    "AROONOSC 0", 
    "ATR 0", 
    "BOP 0", 
    "CCI 0", 
    "CMO 0", 
    "CVI 0", 
    "DI_Plus 0", 
    "DI_Minus 0", 
    "DM_Plus 0", 
    "DM_Minus 0", 
    "DPO 0", 
    "DX 0", 
    "FISHER 0", 
    "FISHER_Signal 0", 
    "FOSC 0", 
    "LINREGINTERCEPT 0", 
    "LINREGSLOPE 0", 
    "MACD 0", 
    "MACD_Signal 0", 
    "MACD_Histo 0", 
    "MARKETFI 0",
    "MASS 0", 
    "MFI 0", 
    "MOM 0", 
    "MSW_Sine 0", 
    "MSW_Lead 0", 
    "NATR 0", 
    "NVI 0", 
    "OBV 0", 
    "PPO 0", 
    "PVI 0", 
    "QSTICK 0", 
    "ROC 0", 
    "ROCR 0", 
    "RSI 0", 
    "STOCH_k 0", 
    "STOCH_d 0", 
    "STOCHRSI 0", 
    "TR 0", 
    "TRIX 0", 
    "ULTOSC 0", 
    "VHF 0", 
    "VOLATILITYINDICATOR 0", 
    "VOSC 0", 
    "WAD 0", 
    "WILLR 0",  
    "rAVGPRICE 0", 
    "rBBANDS_Lower 0", 
    "rBBANDS_Middle 0", 
    "rBBANDS_Upper 0", 
    "rDEMA 0", 
    "rEMA 0", 
    "rHMA 0", 
    "rKAMA 0", 
    "rLINREG 0", 
    "rMEDPRICE 0", 
    "rPSAR 0", 
    "rSMA 0", 
    "rTEMA 0",  
    "rTRIMA 0", 
    "rTSF 0", 
    "rTYPPRICE 0",  
    "rVIDYA 0", 
    "rVWMA 0",  
    "rWCPRICE 0",  
    "rWILDERS 0", 
    "rWMA 0", 
    "rZLEMA 0",
    "relbADXRaADX 0",
    "relbAROON_DownaAROON_Up 0",
    "relbAROON_Downa50 0",
    "relbAROON_Upa50 0",
    "relbCMOa10pCMOSMA 0",
    "relbDI_MinusaDI_Plus 0",
    "relbDM_MinusaDM_Plus 0",
    "relbFISHERaFISHER_Signal 0",
    "relbLINREGSLOPEa20pLINREGSLOPESMA 0", 
    "relbMACDaMACD_Signal 0",
    "relbMASSa27 0",
    "relbMSW_LeadaMSW_sine 0",
    "relbNVIa20pNVIEMA 0",
    "relbPVIa20pPVIEMA 0",
    "relbQSTICKa20pQSTICKSMA 0",
    "relbSTOCH_daSTOCH_k 0",
    "relbTRIXa9pTRIXEMA 0",
    "relbWILLRan50 0",
    "relbBBANDS_LoweraReal 0",
    "relbBBANDS_UpperaReal 0",
    "relb21pDEMAa55pDEMA 0",
    "relb15pDEMAa21pDEMA 0",
    "relb15pDEMAa55pDEMA 0",
    "relb12pEMAa26pEMA 0",
    "relbKAMAaReal 0",
    "relb10pSMAa40pSMA 0",


    "volume 1", 
    "priceChange 1", 
    "AD 1", 
    "ADOSC 1", 
    "ADX 1", 
    "ADXR 1", 
    "AO 1", 
    "APO 1", 
    "AROON_Down 1", 
    "AROON_Up 1", 
    "AROONOSC 1", 
    "ATR 1", 
    "BOP 1", 
    "CCI 1", 
    "CMO 1", 
    "CVI 1", 
    "DI_Plus 1", 
    "DI_Minus 1", 
    "DM_Plus 1", 
    "DM_Minus 1", 
    "DPO 1", 
    "DX 1", 
    "FISHER 1", 
    "FISHER_Signal 1", 
    "FOSC 1", 
    "LINREGINTERCEPT 1", 
    "LINREGSLOPE 1", 
    "MACD 1", 
    "MACD_Signal 1", 
    "MACD_Histo 1", 
    "MARKETFI 1", 
    "MASS 1", 
    "MFI 1", 
    "MOM 1", 
    "MSW_Sine 1", 
    "MSW_Lead 1", 
    "NATR 1", 
    "NVI 1", 
    "OBV 1", 
    "PPO 1", 
    "PVI 1", 
    "QSTICK 1", 
    "ROC 1", 
    "ROCR 1", 
    "RSI 1", 
    "STOCH_k 1", 
    "STOCH_d 1", 
    "STOCHRSI 1", 
    "TR 1", 
    "TRIX 1", 
    "ULTOSC 1", 
    "VHF 1", 
    "VOLATILITYINDICATOR 1", 
    "VOSC 1", 
    "WAD 1", 
    "WILLR 1", 
    "rAVGPRICE 1", 
    "rBBANDS_Lower 1", 
    "rBBANDS_Middle 1", 
    "rBBANDS_Upper 1", 
    "rDEMA 1", 
    "rEMA 1", 
    "rHMA 1", 
    "rKAMA 1",  
    "rLINREG 1",  
    "rMEDPRICE 1", 
    "rPSAR 1", 
    "rSMA 1", 
    "rTEMA 1",  
    "rTRIMA 1", 
    "rTSF 1", 
    "rTYPPRICE 1",  
    "rVIDYA 1", 
    "rVWMA 1",  
    "rWCPRICE 1",  
    "rWILDERS 1", 
    "rWMA 1", 
    "rZLEMA 1",
    "relbADXRaADX 1",
    "relbAROON_DownaAROON_Up 1",
    "relbAROON_Downa50 1",
    "relbAROON_Upa50 1",
    "relbCMOa10pCMOSMA 1",
    "relbDI_MinusaDI_Plus 1",
    "relbDM_MinusaDM_Plus 1",
    "relbFISHERaFISHER_Signal 1",
    "relbLINREGSLOPEa20pLINREGSLOPESMA 1",
    "relbMACDaMACD_Signal 1",
    "relbMASSa27 1",
    "relbMSW_LeadaMSW_sine 1",
    "relbNVIa20pNVIEMA 1",
    "relbPVIa20pPVIEMA 1",
    "relbQSTICKa20pQSTICKSMA 1",
    "relbSTOCH_daSTOCH_k 1",
    "relbTRIXa9pTRIXEMA 1",
    "relbWILLRan50 1",
    "relbBBANDS_LoweraReal 1",
    "relbBBANDS_UpperaReal 1",
    "relb21pDEMAa55pDEMA 1",
    "relb15pDEMAa21pDEMA 1",
    "relb15pDEMAa55pDEMA 1",
    "relb12pEMAa26pEMA 1",
    "relbKAMAaReal 1",
    "relb10pSMAa40pSMA 1",


    "volume 2", 
    "priceChange 2", 
    "AD 2", 
    "ADOSC 2", 
    "ADX 2", 
    "ADXR 2", 
    "AO 2", 
    "APO 2", 
    "AROON_Down 2", 
    "AROON_Up 2", 
    "AROONOSC 2", 
    "ATR 2", 
    "BOP 2", 
    "CCI 2", 
    "CMO 2", 
    "CVI 2", 
    "DI_Plus 2", 
    "DI_Minus 2", 
    "DM_Plus 2", 
    "DM_Minus 2", 
    "DPO 2", 
    "DX 2", 
    "FISHER 2", 
    "FISHER_Signal 2", 
    "FOSC 2", 
    "LINREGINTERCEPT 2", 
    "LINREGSLOPE 2", 
    "MACD 2", 
    "MACD_Signal 2", 
    "MACD_Histo 2", 
    "MARKETFI 2", 
    "MASS 2", 
    "MFI 2", 
    "MOM 2", 
    "MSW_Sine 2", 
    "MSW_Lead 2", 
    "NATR 2", 
    "NVI 2", 
    "OBV 2", 
    "PPO 2", 
    "PVI 2", 
    "QSTICK 2", 
    "ROC 2", 
    "ROCR 2", 
    "RSI 2", 
    "STOCH_k 2", 
    "STOCH_d 2", 
    "STOCHRSI 2", 
    "TR 2", 
    "TRIX 2", 
    "ULTOSC 2", 
    "VHF 2", 
    "VOLATILITYINDICATOR 2", 
    "VOSC 2", 
    "WAD 2", 
    "WILLR 2", 
    "rAVGPRICE 2", 
    "rBBANDS_Lower 2", 
    "rBBANDS_Middle 2", 
    "rBBANDS_Upper 2", 
    "rDEMA 2", 
    "rEMA 2", 
    "rHMA 2", 
    "rKAMA 2",  
    "rLINREG 2",  
    "rMEDPRICE 2", 
    "rPSAR 2", 
    "rSMA 2", 
    "rTEMA 2",  
    "rTRIMA 2", 
    "rTSF 2", 
    "rTYPPRICE 2",  
    "rVIDYA 2", 
    "rVWMA 2",  
    "rWCPRICE 2",  
    "rWILDERS 2", 
    "rWMA 2", 
    "rZLEMA 2",
    "relbADXRaADX 2",
    "relbAROON_DownaAROON_Up 2",
    "relbAROON_Downa50 2",
    "relbAROON_Upa50 2",
    "relbCMOa10pCMOSMA 2",
    "relbDI_MinusaDI_Plus 2",
    "relbDM_MinusaDM_Plus 2",
    "relbFISHERaFISHER_Signal 2",
    "relbLINREGSLOPEa20pLINREGSLOPESMA 2",
    "relbMACDaMACD_Signal 2",
    "relbMASSa27 2",
    "relbMSW_LeadaMSW_sine 2",
    "relbNVIa20pNVIEMA 2",
    "relbPVIa20pPVIEMA 2",
    "relbQSTICKa20pQSTICKSMA 2",
    "relbSTOCH_daSTOCH_k 2",
    "relbTRIXa9pTRIXEMA 2",
    "relbWILLRan50 2",
    "relbBBANDS_LoweraReal 2",
    "relbBBANDS_UpperaReal 2",
    "relb21pDEMAa55pDEMA 2",
    "relb15pDEMAa21pDEMA 2",
    "relb15pDEMAa55pDEMA 2",
    "relb12pEMAa26pEMA 2",
    "relbKAMAaReal 2",
    "relb10pSMAa40pSMA 2",


    "volume 3", 
    "priceChange 3", 
    "AD 3", 
    "ADOSC 3", 
    "ADX 3", 
    "ADXR 3", 
    "AO 3", 
    "APO 3", 
    "AROON_Down 3", 
    "AROON_Up 3", 
    "AROONOSC 3", 
    "ATR 3", 
    "BOP 3", 
    "CCI 3", 
    "CMO 3", 
    "CVI 3", 
    "DI_Plus 3", 
    "DI_Minus 3", 
    "DM_Plus 3", 
    "DM_Minus 3", 
    "DPO 3", 
    "DX 3", 
    "FISHER 3", 
    "FISHER_Signal 3", 
    "FOSC 3", 
    "LINREGINTERCEPT 3", 
    "LINREGSLOPE 3", 
    "MACD 3", 
    "MACD_Signal 3", 
    "MACD_Histo 3", 
    "MARKETFI 3", 
    "MASS 3", 
    "MFI 3", 
    "MOM 3", 
    "MSW_Sine 3", 
    "MSW_Lead 3", 
    "NATR 3", 
    "NVI 3", 
    "OBV 3", 
    "PPO 3", 
    "PVI 3", 
    "QSTICK 3", 
    "ROC 3", 
    "ROCR 3", 
    "RSI 3", 
    "STOCH_k 3", 
    "STOCH_d 3", 
    "STOCHRSI 3", 
    "TR 3", 
    "TRIX 3", 
    "ULTOSC 3", 
    "VHF 3", 
    "VOLATILITYINDICATOR 3", 
    "VOSC 3", 
    "WAD 3", 
    "WILLR 3", 
    "rAVGPRICE 3", 
    "rBBANDS_Lower 3", 
    "rBBANDS_Middle 3", 
    "rBBANDS_Upper 3", 
    "rDEMA 3", 
    "rEMA 3", 
    "rHMA 3", 
    "rKAMA 3",  
    "rLINREG 3",  
    "rMEDPRICE 3", 
    "rPSAR 3", 
    "rSMA 3", 
    "rTEMA 3",  
    "rTRIMA 3", 
    "rTSF 3", 
    "rTYPPRICE 3",  
    "rVIDYA 3", 
    "rVWMA 3",  
    "rWCPRICE 3",  
    "rWILDERS 3", 
    "rWMA 3", 
    "rZLEMA 3",
    "relbADXRaADX 3",
    "relbAROON_DownaAROON_Up 3",
    "relbAROON_Downa50 3",
    "relbAROON_Upa50 3",
    "relbCMOa10pCMOSMA 3",
    "relbDI_MinusaDI_Plus 3",
    "relbDM_MinusaDM_Plus 3",
    "relbFISHERaFISHER_Signal 3",
    "relbLINREGSLOPEa20pLINREGSLOPESMA 3",
    "relbMACDaMACD_Signal 3",
    "relbMASSa27 3",
    "relbMSW_LeadaMSW_sine 3",
    "relbNVIa20pNVIEMA 3",
    "relbPVIa20pPVIEMA 3",
    "relbQSTICKa20pQSTICKSMA 3",
    "relbSTOCH_daSTOCH_k 3",
    "relbTRIXa9pTRIXEMA 3",
    "relbWILLRan50 3",
    "relbBBANDS_LoweraReal 3",
    "relbBBANDS_UpperaReal 3",
    "relb21pDEMAa55pDEMA 3",
    "relb15pDEMAa21pDEMA 3",
    "relb15pDEMAa55pDEMA 3",
    "relb12pEMAa26pEMA 3",
    "relbKAMAaReal 3",
    "relb10pSMAa40pSMA 3",
];




module.exports =
{
	inputScheme
}