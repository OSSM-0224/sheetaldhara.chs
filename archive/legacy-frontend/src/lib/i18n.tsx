import React, { createContext, useContext, useState } from 'react';

export type Language = 'en' | 'hi' | 'mr';

export interface Translations {
  // Common & Branding
  societyName: string;
  societyTitle: string;
  societySub: string;
  residentPortal: string;
  auditTrail: string;
  flat: string;
  role: string;
  logout: string;
  refresh: string;
  cancel: string;
  save: string;
  delete: string;
  edit: string;
  add: string;
  back: string;
  loading: string;
  phone: string;
  status: string;
  actions: string;
  time: string;
  success: string;
  error: string;
  close: string;

  // Nav
  navSearch: string;
  navMyVehicles: string;
  navResidents: string;
  navAllVehicles: string;
  navAuditLogs: string;
  navWatchmen: string;
  navOutsiders: string;
  navWatchmanGate: string;

  // Auth View
  authPortalBadge: string;
  authTitle: string;
  authSubtitle: string;
  authTabResident: string;
  authTabAdmin: string;
  authTabWatchman: string;
  authResidentTitle: string;
  authResidentSubtitle: string;
  authAdminTitle: string;
  authAdminSubtitle: string;
  authWatchmanTitle: string;
  authWatchmanSubtitle: string;
  authFlatNumber: string;
  authFlatPlaceholder: string;
  authMobile: string;
  authMobilePlaceholder: string;
  authPassword: string;
  authPasswordPlaceholder: string;
  authBtnResidentSignIn: string;
  authBtnAdminLogin: string;
  authBtnWatchmanLogin: string;
  authResidentDemoHint: string;
  authAdminDemoHint: string;
  authWatchmanDemoHint: string;
  authNotFoundNotice: string;
  authContactAdmin: string;

  // Dashboard / Search View
  searchHeading: string;
  searchSubtitle: string;
  searchLabel: string;
  searchPlaceholder: string;
  searchHint: string;
  searchBtn: string;
  searchBtnLoading: string;
  quickExamples: string;
  matchesFound: string;
  selectModelBelow: string;
  zeroMatchesTitle: string;
  zeroMatchesDesc: string;
  selectOneOfVehicles: string;
  selectOneOfVehiclesDesc: string;
  welcomeCardBadge: string;
  welcomeCardTitle: string;
  welcomeCardDesc: string;
  welcomePrivacy: string;
  welcomePrivacyVal: string;
  welcomeDuplicate: string;
  welcomeDuplicateVal: string;
  welcomeInstantDial: string;
  welcomeInstantDialVal: string;

  // Owner Card
  ownerMatchBadge: string;
  ownerRegisteredVehicle: string;
  ownerNameLabel: string;
  ownerRoomLabel: string;
  ownerParkingLabel: string;
  ownerContactLabel: string;
  ownerCallBtn: string;
  ownerCopyBtn: string;
  ownerCopied: string;
  ownerBackBtn: string;
  ownerNone: string;

  // My Vehicles View (Read-Only)
  myVehiclesBadge: string;
  myVehiclesTitle: string;
  myVehiclesSubtitle: string;
  myVehiclesReadOnlyNotice: string;
  myVehiclesEmptyTitle: string;
  myVehiclesEmptyDesc: string;
  myVehiclesBikeParkingNotice: string;
  bikeNoParkingSlot: string;

  // Admin Residents CRUD View
  adminResidentsBadge: string;
  adminResidentsTitle: string;
  adminResidentsSubtitle: string;
  adminResidentsSearchPlaceholder: string;
  adminStatResidents: string;
  adminStatVehicles: string;
  adminStatFlats: string;
  adminBtnAddResident: string;
  adminBtnEditResident: string;
  adminBtnDeleteResident: string;
  adminModalAddResident: string;
  adminModalEditResident: string;
  adminModalResidentSubtitle: string;
  adminFieldFullName: string;
  adminFieldFullNamePlaceholder: string;
  adminFieldRoomNumber: string;
  adminFieldRoomPlaceholder: string;
  adminFieldPhone: string;
  adminFieldPhonePlaceholder: string;
  adminResidentVehiclesCount: string;
  adminAddVehicleBtn: string;
  adminDeleteResidentConfirm: string;

  // Admin Vehicles View
  adminVehiclesBadge: string;
  adminVehiclesTitle: string;
  adminVehiclesSubtitle: string;
  adminVehiclesSearchPlaceholder: string;
  adminVehiclesStatTotal: string;
  adminVehiclesStatCars: string;
  adminVehiclesStatBikes: string;
  adminVehiclesStatOther: string;
  adminVehiclesTablePlate: string;
  adminVehiclesTableType: string;
  adminVehiclesTableDetails: string;
  adminVehiclesTableOwner: string;
  adminVehiclesTableParking: string;
  adminVehiclesConfirmDelete: string;
  adminVehiclesEmpty: string;
  adminVehiclesAddBtn: string;
  adminVehiclesModalAddTitle: string;
  adminVehiclesModalEditTitle: string;
  adminVehiclesModalSubtitle: string;
  adminVehiclesSelectResident: string;
  adminVehiclesTypeLabel: string;
  adminVehiclesTypeCar: string;
  adminVehiclesTypeBike: string;
  adminVehiclesTypeOther: string;
  adminVehiclesBrandLabel: string;
  adminVehiclesBrandPlaceholder: string;
  adminVehiclesModelLabel: string;
  adminVehiclesModelPlaceholder: string;
  adminVehiclesPlateLabel: string;
  adminVehiclesPlatePlaceholder: string;
  adminVehiclesParkingLabel: string;
  adminVehiclesParkingPlaceholder: string;

  // Admin Logs View
  adminLogsBadge: string;
  adminLogsTitle: string;
  adminLogsSubtitle: string;
  adminLogsResetSeed: string;
  adminLogsTableTime: string;
  adminLogsTableUser: string;
  adminLogsTableFlat: string;
  adminLogsTableQuery: string;
  adminLogsTableMatched: string;
  adminLogsEmptyTitle: string;
  adminLogsEmptyDesc: string;
  adminLogsResetConfirm: string;
  adminLogsResetSuccess: string;

  // Watchman Console
  watchmanConsoleBadge: string;
  watchmanConsoleTitle: string;
  watchmanConsoleSubtitle: string;
  watchmanFormTitle: string;
  watchmanFormSubtitle: string;
  watchmanPlateLabel: string;
  watchmanPlatePlaceholder: string;
  watchmanVehicleTypeLabel: string;
  watchmanOwnerPhoneLabel: string;
  watchmanOwnerPhonePlaceholder: string;
  watchmanOwnerNameLabel: string;
  watchmanOwnerNamePlaceholder: string;
  watchmanNoteLabel: string;
  watchmanNotePlaceholder: string;
  watchmanSubmitBtn: string;
  watchmanSubmitting: string;
  watchmanEntriesTitle: string;
  watchmanEntriesSubtitle: string;
  watchmanStatusInside: string;
  watchmanStatusExited: string;
  watchmanMarkExitedBtn: string;
  watchmanConfirmExit: string;
  watchmanEntrySuccess: string;
  watchmanSearchEntriesPlaceholder: string;
  watchmanNoEntriesTitle: string;
  watchmanNoEntriesDesc: string;

  // Admin Watchmen
  adminWatchmenBadge: string;
  adminWatchmenTitle: string;
  adminWatchmenSubtitle: string;
  adminWatchmenAddBtn: string;
  adminWatchmenModalAddTitle: string;
  adminWatchmenModalEditTitle: string;
  adminWatchmenModalSubtitle: string;
  adminWatchmenStatusActive: string;
  adminWatchmenStatusInactive: string;
  adminWatchmenConfirmDelete: string;
  adminWatchmenEmpty: string;

  // Admin Outsiders
  adminOutsidersBadge: string;
  adminOutsidersTitle: string;
  adminOutsidersSubtitle: string;
  adminOutsidersStatTotal: string;
  adminOutsidersStatInside: string;
  adminOutsidersStatExited: string;
  adminOutsidersSearchPlaceholder: string;
  adminOutsidersFilterAll: string;
  adminOutsidersFilterInside: string;
  adminOutsidersFilterExited: string;
  adminOutsidersEmpty: string;

  // Owner Card additions
  ownerOutsiderBadge: string;
  ownerVisitingPurpose: string;
  ownerLoggedBy: string;
  ownerEntryTime: string;
  ownerVehicleStatus: string;

  // Footer
  footerSociety: string;
  footerTagline: string;
}

export const translations: Record<Language, Translations> = {
  en: {
    societyName: 'SHEETALDHARA CHS',
    societyTitle: 'SHEETALDHARA Co-op Housing Society Ltd.',
    societySub: 'Vehicle Owner Lookup Portal',
    residentPortal: 'Resident Portal',
    auditTrail: 'Audit Trail',
    flat: 'Flat',
    role: 'Role',
    logout: 'Sign Out',
    refresh: 'Refresh',
    cancel: 'Cancel',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    add: 'Add',
    back: 'Back',
    loading: 'Loading...',
    phone: 'Phone',
    status: 'Status',
    actions: 'Actions',
    time: 'Time',
    success: 'Success',
    error: 'Error',
    close: 'Close',

    navSearch: 'Search Vehicle',
    navMyVehicles: 'My Flat Vehicles',
    navResidents: 'Residents Directory',
    navAllVehicles: 'All Vehicles',
    navAuditLogs: 'Search Audit Logs',
    navWatchmen: 'Watchmen',
    navOutsiders: 'Visitor Vehicles',
    navWatchmanGate: 'Gate Console',

    authPortalBadge: 'SHEETALDHARA CHS',
    authTitle: 'Society Vehicle Lookup',
    authSubtitle: 'Instantly find and contact flat owners when vehicles are blocking your parking bay.',
    authTabResident: 'Resident Sign-In',
    authTabAdmin: 'Admin Login',
    authTabWatchman: 'Watchman Login',
    authResidentTitle: 'Resident Sign-In',
    authResidentSubtitle: 'Enter your Room / Flat Number and registered Phone Number. No password required.',
    authAdminTitle: 'Society Administrator Login',
    authAdminSubtitle: 'Enter the committee phone number and administrator password to manage society records.',
    authWatchmanTitle: 'Gate Watchman Login',
    authWatchmanSubtitle: 'Enter your watchman phone number and assigned password to log visitor vehicle entries.',
    authFlatNumber: 'Room / Flat Number',
    authFlatPlaceholder: 'e.g. B-304 or A-101',
    authMobile: 'Registered Mobile Number',
    authMobilePlaceholder: '10-digit mobile number',
    authPassword: 'Password',
    authPasswordPlaceholder: 'Enter password',
    authBtnResidentSignIn: 'Sign In as Resident',
    authBtnAdminLogin: 'Log In as Admin',
    authBtnWatchmanLogin: 'Log In as Gate Watchman',
    authResidentDemoHint: 'Demo Residents (Tap to fill):',
    authAdminDemoHint: 'Admin Account (Tap to fill):',
    authWatchmanDemoHint: 'Gate Watchman (Tap to fill):',
    authNotFoundNotice: "We couldn't find this room/phone combination. Please contact your society admin.",
    authContactAdmin: 'Residents are registered exclusively by society management.',

    searchHeading: 'Vehicle Lookup',
    searchSubtitle: 'Find resident contact details for vehicles blocking your parking spot.',
    searchLabel: 'Search Plate Number',
    searchPlaceholder: 'e.g. MH04AX4821 or 4821',
    searchHint: 'Press Enter to search • ESC to clear',
    searchBtn: 'Search',
    searchBtnLoading: 'Searching...',
    quickExamples: 'Quick Test Examples',
    matchesFound: 'Matches Found',
    selectModelBelow: 'Select Model Below',
    zeroMatchesTitle: 'No vehicle found ending in',
    zeroMatchesDesc: 'Please verify the plate number or check with society security gate.',
    selectOneOfVehicles: 'Select One of Vehicles',
    selectOneOfVehiclesDesc: 'Click a vehicle in the left column that matches the color or model blocking your slot to reveal the owner contact.',
    welcomeCardBadge: 'SHEETALDHARA CHS Directory',
    welcomeCardTitle: 'Fast Parking Resolution',
    welcomeCardDesc: 'Search with the last 4 digits (e.g. 4821) or the full state plate number to contact flat owners immediately.',
    welcomePrivacy: 'Privacy Protection',
    welcomePrivacyVal: 'Registered Residents Only',
    welcomeDuplicate: 'Duplicate Support',
    welcomeDuplicateVal: 'Model Disambiguation',
    welcomeInstantDial: 'Instant Dial',
    welcomeInstantDialVal: '1-Click Owner Calling',

    ownerMatchBadge: 'Vehicle Match',
    ownerRegisteredVehicle: 'Registered Society Vehicle',
    ownerNameLabel: 'Owner Name',
    ownerRoomLabel: 'Room / Flat Number',
    ownerParkingLabel: 'Parking Bay',
    ownerContactLabel: 'Contact Phone',
    ownerCallBtn: 'CALL OWNER',
    ownerCopyBtn: 'COPY PHONE NUMBER',
    ownerCopied: 'COPIED TO CLIPBOARD!',
    ownerBackBtn: 'Back to matching list',
    ownerNone: 'None',

    myVehiclesBadge: 'My Flat Records',
    myVehiclesTitle: 'My Registered Vehicles',
    myVehiclesSubtitle: 'Vehicles linked to your flat in SHEETALDHARA CHS for resident parking lookups.',
    myVehiclesReadOnlyNotice: 'Vehicles are registered and managed directly by your society administration. To add, edit, or remove vehicle records for your flat, please contact society management.',
    myVehiclesEmptyTitle: 'No vehicles registered for your flat',
    myVehiclesEmptyDesc: 'Contact the society administrator to register your car or two-wheeler in the society directory.',
    myVehiclesBikeParkingNotice: 'Bikes do not have assigned parking slots and may be parked anywhere in open society areas.',
    bikeNoParkingSlot: 'Open Parking (Anywhere)',

    adminResidentsBadge: 'Society Directory',
    adminResidentsTitle: 'Residents & Flats Register',
    adminResidentsSubtitle: 'Directly add, edit, or delete approved society residents and assigned flats. Resident data is trusted immediately.',
    adminResidentsSearchPlaceholder: 'Filter residents by name, flat number, or phone...',
    adminStatResidents: 'Total Residents',
    adminStatVehicles: 'Total Registered Vehicles',
    adminStatFlats: 'Active Flats',
    adminBtnAddResident: 'Add New Resident',
    adminBtnEditResident: 'Edit',
    adminBtnDeleteResident: 'Delete',
    adminModalAddResident: 'Add New Society Resident',
    adminModalEditResident: 'Edit Resident Information',
    adminModalResidentSubtitle: 'Enter resident details. The Room Number and Phone Number pair serves as their sign-in credential.',
    adminFieldFullName: 'Resident Full Name',
    adminFieldFullNamePlaceholder: 'e.g. Priya Nair',
    adminFieldRoomNumber: 'Room / Flat Number',
    adminFieldRoomPlaceholder: 'e.g. B-304',
    adminFieldPhone: 'Mobile Phone Number',
    adminFieldPhonePlaceholder: 'e.g. 9820022334',
    adminResidentVehiclesCount: 'Vehicles',
    adminAddVehicleBtn: 'Add Vehicle',
    adminDeleteResidentConfirm: 'Are you sure you want to delete this resident? All associated vehicles will also be removed.',

    adminVehiclesBadge: 'Society Fleet Register',
    adminVehiclesTitle: 'All Society Registered Vehicles',
    adminVehiclesSubtitle: 'Full registry of all cars and two-wheelers in SHEETALDHARA CHS. Directly add, edit, or delete vehicles.',
    adminVehiclesSearchPlaceholder: 'Filter by plate, resident, flat, brand...',
    adminVehiclesStatTotal: 'Total Vehicles',
    adminVehiclesStatCars: 'Cars (Four-Wheelers)',
    adminVehiclesStatBikes: 'Bikes (Two-Wheelers)',
    adminVehiclesStatOther: 'Others',
    adminVehiclesTablePlate: 'Number Plate',
    adminVehiclesTableType: 'Type',
    adminVehiclesTableDetails: 'Make & Model',
    adminVehiclesTableOwner: 'Resident Owner',
    adminVehiclesTableParking: 'Slot / Bay',
    adminVehiclesConfirmDelete: 'Remove this vehicle from the society register?',
    adminVehiclesEmpty: 'No vehicles match your search criteria.',
    adminVehiclesAddBtn: 'Add Vehicle',
    adminVehiclesModalAddTitle: 'Register New Vehicle',
    adminVehiclesModalEditTitle: 'Update Vehicle Details',
    adminVehiclesModalSubtitle: 'Directly register or update vehicle details for an approved society resident.',
    adminVehiclesSelectResident: 'Assigned Resident / Flat',
    adminVehiclesTypeLabel: 'Vehicle Category',
    adminVehiclesTypeCar: 'Four-Wheeler (Car / SUV)',
    adminVehiclesTypeBike: 'Two-Wheeler (Bike / Scooter)',
    adminVehiclesTypeOther: 'Other Vehicle',
    adminVehiclesBrandLabel: 'Manufacturer / Make',
    adminVehiclesBrandPlaceholder: 'e.g. Honda, Maruti, Tata, Hyundai',
    adminVehiclesModelLabel: 'Model & Color',
    adminVehiclesModelPlaceholder: 'e.g. City White, Nexon Grey, Activa',
    adminVehiclesPlateLabel: 'Registration Plate Number',
    adminVehiclesPlatePlaceholder: 'e.g. MH04AX4821 or MH-02-CD-9090',
    adminVehiclesParkingLabel: 'Assigned Parking Slot / Bay (Cars Only)',
    adminVehiclesParkingPlaceholder: 'e.g. P-24, B-12',

    adminLogsBadge: 'Audit Trail',
    adminLogsTitle: 'Search Audit Logs',
    adminLogsSubtitle: 'Complete log of number plate lookup queries executed by society residents.',
    adminLogsResetSeed: 'Reset Demo Data',
    adminLogsTableTime: 'Time',
    adminLogsTableUser: 'Searched By Resident',
    adminLogsTableFlat: 'Flat',
    adminLogsTableQuery: 'Search Query',
    adminLogsTableMatched: 'Matched Plate',
    adminLogsEmptyTitle: 'No search logs recorded yet',
    adminLogsEmptyDesc: 'Queries made by residents will appear here for audit and security compliance.',
    adminLogsResetConfirm: 'Reset database to default sample records?',
    adminLogsResetSuccess: 'Database restored to default demo seed.',

    // Watchman Console
    watchmanConsoleBadge: 'Gate Security Guard Console',
    watchmanConsoleTitle: 'Outsider & Visitor Vehicle Registration',
    watchmanConsoleSubtitle: 'Quickly log visitor or delivery vehicles parked inside society premises so residents can contact them.',
    watchmanFormTitle: 'Log New Visitor Vehicle',
    watchmanFormSubtitle: 'Record vehicle plate and driver/owner contact number on arrival.',
    watchmanPlateLabel: 'Vehicle License Plate',
    watchmanPlatePlaceholder: 'e.g. MH04BX9921',
    watchmanVehicleTypeLabel: 'Vehicle Type',
    watchmanOwnerPhoneLabel: 'Driver / Owner Phone Number',
    watchmanOwnerPhonePlaceholder: '10-digit mobile number',
    watchmanOwnerNameLabel: 'Owner / Driver Name (Optional)',
    watchmanOwnerNamePlaceholder: 'e.g. Rajesh Kumar or Zomato Delivery',
    watchmanNoteLabel: 'Visiting Purpose / Flat Note (Optional)',
    watchmanNotePlaceholder: 'e.g. Visiting Flat B-304, Grocery Delivery',
    watchmanSubmitBtn: 'Log Vehicle Entry',
    watchmanSubmitting: 'Logging Entry...',
    watchmanEntriesTitle: 'My Logged Visitor Entries',
    watchmanEntriesSubtitle: 'Recent outsider vehicles registered at the security gate by you.',
    watchmanStatusInside: 'Inside Society',
    watchmanStatusExited: 'Exited Gate',
    watchmanMarkExitedBtn: 'Mark Exited',
    watchmanConfirmExit: 'Confirm this vehicle has exited the society gate?',
    watchmanEntrySuccess: 'Visitor vehicle successfully recorded.',
    watchmanSearchEntriesPlaceholder: 'Search your entries by plate or phone...',
    watchmanNoEntriesTitle: 'No visitor vehicles logged yet',
    watchmanNoEntriesDesc: 'Use the form above to log cars or bikes entering the society gate.',

    // Admin Watchmen
    adminWatchmenBadge: 'Gate Security Personnel',
    adminWatchmenTitle: 'Security Watchmen Accounts',
    adminWatchmenSubtitle: 'Manage security guard accounts authorized to log outsider vehicles at the society gates.',
    adminWatchmenAddBtn: 'Add Watchman Account',
    adminWatchmenModalAddTitle: 'Register Security Watchman',
    adminWatchmenModalEditTitle: 'Edit Watchman Account',
    adminWatchmenModalSubtitle: 'Create phone-based login credentials for gate security guards.',
    adminWatchmenStatusActive: 'Active',
    adminWatchmenStatusInactive: 'Inactive',
    adminWatchmenConfirmDelete: 'Delete this watchman account permanently?',
    adminWatchmenEmpty: 'No watchman accounts created yet. Click above to add your first guard.',

    // Admin Outsiders
    adminOutsidersBadge: 'Visitor Management Registry',
    adminOutsidersTitle: 'Outsider & Delivery Vehicles',
    adminOutsidersSubtitle: 'Complete log of all non-resident visitor, delivery, and contractor vehicles parked in society.',
    adminOutsidersStatTotal: 'Total Visitors Logged',
    adminOutsidersStatInside: 'Currently Inside',
    adminOutsidersStatExited: 'Exited Premises',
    adminOutsidersSearchPlaceholder: 'Search by plate, owner phone, driver name, or visiting note...',
    adminOutsidersFilterAll: 'All Entries',
    adminOutsidersFilterInside: 'Currently Inside',
    adminOutsidersFilterExited: 'Exited',
    adminOutsidersEmpty: 'No visitor vehicle entries recorded in the system.',

    // Owner Card additions
    ownerOutsiderBadge: 'Visitor / Delivery Vehicle',
    ownerVisitingPurpose: 'Visiting / Purpose Note',
    ownerLoggedBy: 'Logged at Gate by',
    ownerEntryTime: 'Gate Entry Time',
    ownerVehicleStatus: 'Premises Status',

    footerSociety: 'SHEETALDHARA CHS Co-operative Housing Society Ltd.',
    footerTagline: 'Private Resident Tool • Spot Blocking Resolution',
  },

  hi: {
    societyName: 'शीतलधारा सीएचएस',
    societyTitle: 'शीतलधारा को-ऑप हाउसिंग सोसाइटी लि.',
    societySub: 'वाहन मालिक खोज पोर्टल',
    residentPortal: 'निवासी पोर्टल',
    auditTrail: 'ऑडिट ट्रेल',
    flat: 'फ्लैट',
    role: 'भूमिका',
    logout: 'लॉग आउट',
    refresh: 'रिफ्रेश',
    cancel: 'रद्द करें',
    save: 'सहेजें',
    delete: 'हटाएं',
    edit: 'संपादित करें',
    add: 'जोड़ें',
    back: 'वापस',
    loading: 'लोड हो रहा है...',
    phone: 'फ़ोन',
    status: 'स्थिति',
    actions: 'कार्रवाई',
    time: 'समय',
    success: 'सफल',
    error: 'त्रुटि',
    close: 'बंद करें',

    navSearch: 'वाहन खोजें',
    navMyVehicles: 'मेरे फ्लैट के वाहन',
    navResidents: 'निवासी निर्देशिका',
    navAllVehicles: 'सभी वाहन',
    navAuditLogs: 'खोज ऑडिट लॉग्स',
    navWatchmen: 'वॉचमैन',
    navOutsiders: 'आगंतुक वाहन',
    navWatchmanGate: 'गेट कंसोल',

    authPortalBadge: 'शीतलधारा सीएचएस',
    authTitle: 'सोसाइटी वाहन खोज पोर्टल',
    authSubtitle: 'पार्किंग स्थान अवरुद्ध होने पर तुरंत वाहन मालिक का पता लगाएं और संपर्क करें।',
    authTabResident: 'निवासी लॉगिन',
    authTabAdmin: 'व्यवस्थापक लॉगिन',
    authTabWatchman: 'वॉचमैन लॉगिन',
    authResidentTitle: 'निवासी लॉगिन',
    authResidentSubtitle: 'अपना कमरा/फ्लैट नंबर और पंजीकृत फ़ोन नंबर दर्ज करें। किसी पासवर्ड की आवश्यकता नहीं है।',
    authAdminTitle: 'सोसाइटी व्यवस्थापक लॉगिन',
    authAdminSubtitle: 'सोसाइटी रिकॉर्ड्स का प्रबंधन करने के लिए व्यवस्थापक फ़ोन और पासवर्ड दर्ज करें।',
    authWatchmanTitle: 'गेट सुरक्षा वॉचमैन लॉगिन',
    authWatchmanSubtitle: 'आगंतुक वाहनों की प्रविष्टि दर्ज करने के लिए अपना वॉचमैन फ़ोन नंबर व पासवर्ड दर्ज करें।',
    authFlatNumber: 'कमरा / फ्लैट नंबर',
    authFlatPlaceholder: 'उदा. B-304 या A-101',
    authMobile: 'पंजीकृत मोबाइल नंबर',
    authMobilePlaceholder: '10-अंकीय मोबाइल नंबर',
    authPassword: 'पासवर्ड',
    authPasswordPlaceholder: 'पासवर्ड दर्ज करें',
    authBtnResidentSignIn: 'निवासी के रूप में प्रवेश करें',
    authBtnAdminLogin: 'व्यवस्थापक लॉगिन करें',
    authBtnWatchmanLogin: 'गेट वॉचमैन लॉगिन करें',
    authResidentDemoHint: 'डेमो निवासी (भरने के लिए टैप करें):',
    authAdminDemoHint: 'व्यवस्थापक खाता (भरने के लिए टैप करें):',
    authWatchmanDemoHint: 'गेट वॉचमैन (भरने के लिए टैप करें):',
    authNotFoundNotice: "हमें यह कमरा/फ़ोन संयोजन नहीं मिला। कृपया अपने सोसाइटी व्यवस्थापक से संपर्क करें।",
    authContactAdmin: 'निवासी पंजीकरण केवल सोसाइटी प्रबंधन द्वारा किया जाता है।',

    searchHeading: 'वाहन खोज',
    searchSubtitle: 'पार्किंग स्लॉट में खड़ी गाड़ी के मालिक का संपर्क विवरण खोजें।',
    searchLabel: 'नंबर प्लेट खोजें',
    searchPlaceholder: 'उदा. MH04AX4821 या 4821',
    searchHint: 'Enter दबाकर खोजें • साफ़ करने के लिए ESC',
    searchBtn: 'खोजें',
    searchBtnLoading: 'खोज जारी है...',
    quickExamples: 'त्वरित परीक्षण उदाहरण',
    matchesFound: 'वाहन मिले',
    selectModelBelow: 'नीचे से मॉडल चुनें',
    zeroMatchesTitle: 'इस नंबर से कोई वाहन नहीं मिला',
    zeroMatchesDesc: 'कृपया नंबर प्लेट की जांच करें या सोसाइटी सुरक्षा गार्ड से संपर्क करें।',
    selectOneOfVehicles: 'वाहनों में से एक चुनें',
    selectOneOfVehiclesDesc: 'पार्किंग में खड़े वाहन के मॉडल से मेल खाने वाले विकल्प पर क्लिक करें।',
    welcomeCardBadge: 'शीतलधारा सीएचएस डायरेक्टरी',
    welcomeCardTitle: 'त्वरित पार्किंग समाधान',
    welcomeCardDesc: 'वाहन के अंतिम 4 अंक (उदा. 4821) या पूरी नंबर प्लेट दर्ज कर मालिक से तुरंत संपर्क करें।',
    welcomePrivacy: 'गोपनीयता सुरक्षा',
    welcomePrivacyVal: 'केवल पंजीकृत निवासी',
    welcomeDuplicate: 'समान अंक सहायता',
    welcomeDuplicateVal: 'मॉडल द्वारा पहचान',
    welcomeInstantDial: 'सीधा कॉल',
    welcomeInstantDialVal: '1-क्लिक कॉलिंग',

    ownerMatchBadge: 'वाहन मिलान',
    ownerRegisteredVehicle: 'पंजीकृत सोसाइटी वाहन',
    ownerNameLabel: 'मालिक का नाम',
    ownerRoomLabel: 'कमरा / फ्लैट नंबर',
    ownerParkingLabel: 'पार्किंग बे',
    ownerContactLabel: 'संपर्क फ़ोन',
    ownerCallBtn: 'मालिक को कॉल करें',
    ownerCopyBtn: 'फ़ोन नंबर कॉपी करें',
    ownerCopied: 'नंबर कॉपी हो गया!',
    ownerBackBtn: 'सूची पर वापस जाएं',
    ownerNone: 'कोई नहीं',

    myVehiclesBadge: 'मेरे फ्लैट के रिकॉर्ड',
    myVehiclesTitle: 'पंजीकृत वाहन',
    myVehiclesSubtitle: 'पार्किंग पहचान के लिए आपके फ्लैट से जुड़े पंजीकृत वाहन।',
    myVehiclesReadOnlyNotice: 'वाहन पंजीकरण और प्रबंधन सीधे सोसाइटी व्यवस्थापक द्वारा किया जाता है। कोई नया वाहन जोड़ने या विवरण बदलने के लिए सोसाइटी कार्यालय से संपर्क करें।',
    myVehiclesEmptyTitle: 'आपके फ्लैट के लिए कोई वाहन पंजीकृत नहीं है',
    myVehiclesEmptyDesc: 'सोसाइटी निर्देशिका में अपनी कार या बाइक जोड़ने के लिए व्यवस्थापक से संपर्क करें।',
    myVehiclesBikeParkingNotice: 'बाइकों के लिए कोई निश्चित पार्किंग स्लॉट नहीं होता, वे खुले क्षेत्र में कहीं भी पार्क की जा सकती हैं।',
    bikeNoParkingSlot: 'खुली पार्किंग (कहीं भी)',

    adminResidentsBadge: 'सोसाइटी निर्देशिका',
    adminResidentsTitle: 'निवासी एवं फ्लैट रजिस्टर',
    adminResidentsSubtitle: 'सोसाइटी निवासियों को सीधे जोड़ें, संपादित करें या हटाएं। व्यवस्थापक द्वारा दर्ज डेटा तुरंत मान्य होता है।',
    adminResidentsSearchPlaceholder: 'नाम, फ्लैट नंबर या फ़ोन द्वारा खोजें...',
    adminStatResidents: 'कुल निवासी',
    adminStatVehicles: 'पंजीकृत वाहन',
    adminStatFlats: 'सक्रिय फ्लैट्स',
    adminBtnAddResident: 'नया निवासी जोड़ें',
    adminBtnEditResident: 'संपादित करें',
    adminBtnDeleteResident: 'हटाएं',
    adminModalAddResident: 'नया निवासी दर्ज करें',
    adminModalEditResident: 'निवासी विवरण संपादित करें',
    adminModalResidentSubtitle: 'कमरा नंबर और फ़ोन नंबर की जोड़ी ही निवासी के लॉगिन क्रेडेंशियल होंगे।',
    adminFieldFullName: 'निवासी का पूरा नाम',
    adminFieldFullNamePlaceholder: 'उदा. प्रिया नायर',
    adminFieldRoomNumber: 'कमरा / फ्लैट नंबर',
    adminFieldRoomPlaceholder: 'उदा. B-304',
    adminFieldPhone: 'मोबाइल नंबर',
    adminFieldPhonePlaceholder: 'उदा. 9820022334',
    adminResidentVehiclesCount: 'वाहन',
    adminAddVehicleBtn: 'वाहन जोड़ें',
    adminDeleteResidentConfirm: 'क्या आप इस निवासी को हटाना चाहते हैं? इस फ्लैट के सभी पंजीकृत वाहन भी हट जाएंगे।',

    adminVehiclesBadge: 'सोसाइटी वाहन रजिस्टर',
    adminVehiclesTitle: 'शीतलधारा सीएचएस के सभी वाहन',
    adminVehiclesSubtitle: 'सोसाइटी के सभी वाहनों का संपूर्ण रजिस्टर। व्यवस्थापक सीधे वाहन जोड़, संपादित या हटा सकते हैं।',
    adminVehiclesSearchPlaceholder: 'नंबर, निवासी, कमरा, ब्रांड द्वारा खोजें...',
    adminVehiclesStatTotal: 'कुल वाहन',
    adminVehiclesStatCars: 'कार (चार पहिया)',
    adminVehiclesStatBikes: 'बाइक (दोपहिया)',
    adminVehiclesStatOther: 'अन्य',
    adminVehiclesTablePlate: 'नंबर प्लेट',
    adminVehiclesTableType: 'प्रकार',
    adminVehiclesTableDetails: 'कंपनी व मॉडल',
    adminVehiclesTableOwner: 'मालिक',
    adminVehiclesTableParking: 'पार्किंग स्लॉट',
    adminVehiclesConfirmDelete: 'इस वाहन को रजिस्टर से हटाएं?',
    adminVehiclesEmpty: 'खोज से मेल खाता कोई वाहन नहीं मिला।',
    adminVehiclesAddBtn: 'वाहन जोड़ें',
    adminVehiclesModalAddTitle: 'नया वाहन जोड़ें',
    adminVehiclesModalEditTitle: 'वाहन विवरण अपडेट करें',
    adminVehiclesModalSubtitle: 'सोसाइटी निवासी के लिए वाहन का विवरण सीधे दर्ज करें।',
    adminVehiclesSelectResident: 'आवंटित निवासी / फ्लैट',
    adminVehiclesTypeLabel: 'वाहन श्रेणी',
    adminVehiclesTypeCar: 'चार पहिया (कार / एसयूवी)',
    adminVehiclesTypeBike: 'दोपहिया (बाइक / स्कूटर)',
    adminVehiclesTypeOther: 'अन्य वाहन',
    adminVehiclesBrandLabel: 'कंपनी / मेक',
    adminVehiclesBrandPlaceholder: 'उदा. Honda, Maruti, Tata',
    adminVehiclesModelLabel: 'मॉडल व रंग',
    adminVehiclesModelPlaceholder: 'उदा. City White, Nexon Grey, Activa',
    adminVehiclesPlateLabel: 'नंबर प्लेट',
    adminVehiclesPlatePlaceholder: 'उदा. MH04AX4821',
    adminVehiclesParkingLabel: 'पार्किंग स्लॉट (केवल कारों के लिए)',
    adminVehiclesParkingPlaceholder: 'उदा. P-24, B-12',

    adminLogsBadge: 'ऑडिट ट्रेल',
    adminLogsTitle: 'खोज ऑडिट लॉग्स',
    adminLogsSubtitle: 'निवासियों द्वारा की गई सभी नंबर प्लेट खोजों का रिकॉर्ड।',
    adminLogsResetSeed: 'डेमो डेटा रीसेट करें',
    adminLogsTableTime: 'समय',
    adminLogsTableUser: 'खोजकर्ता निवासी',
    adminLogsTableFlat: 'फ्लैट',
    adminLogsTableQuery: 'सर्च क्वेरी',
    adminLogsTableMatched: 'मिला वाहन',
    adminLogsEmptyTitle: 'अभी तक कोई सर्च रिकॉर्ड नहीं है',
    adminLogsEmptyDesc: 'सुरक्षा और ऑडिट अनुपालन के लिए सभी खोजें यहाँ दर्ज होंगी।',
    adminLogsResetConfirm: 'क्या डेटाबेस को डिफ़ॉल्ट डेमो रिकॉर्ड में रीसेट करना चाहते हैं?',
    adminLogsResetSuccess: 'डेटाबेस डिफ़ॉल्ट डेटा में रीसेट हो गया है।',

    // Watchman Console
    watchmanConsoleBadge: 'गेट सुरक्षा गार्ड कंसोल',
    watchmanConsoleTitle: 'आगंतुक व बाहरी वाहन पंजीकरण',
    watchmanConsoleSubtitle: 'सोसाइटी परिसर में खड़े आगंतुक या डिलीवरी वाहनों को तुरंत पंजीकृत करें ताकि जरूरत पड़ने पर निवासी संपर्क कर सकें।',
    watchmanFormTitle: 'नया आगंतुक वाहन दर्ज करें',
    watchmanFormSubtitle: 'गेट पर आगमन पर वाहन नंबर प्लेट व चालक का संपर्क नंबर दर्ज करें।',
    watchmanPlateLabel: 'वाहन नंबर प्लेट',
    watchmanPlatePlaceholder: 'उदा. MH04BX9921',
    watchmanVehicleTypeLabel: 'वाहन प्रकार',
    watchmanOwnerPhoneLabel: 'चालक / मालिक का फ़ोन नंबर',
    watchmanOwnerPhonePlaceholder: '10-अंकीय मोबाइल नंबर',
    watchmanOwnerNameLabel: 'मालिक / चालक का नाम (वैकल्पिक)',
    watchmanOwnerNamePlaceholder: 'उदा. राजेश कुमार या ज़ोमैटो डिलीवरी',
    watchmanNoteLabel: 'मिलने का उद्देश्य / फ्लैट विवरण (वैकल्पिक)',
    watchmanNotePlaceholder: 'उदा. फ्लैट B-304 में आगंतुक, पार्सल डिलीवरी',
    watchmanSubmitBtn: 'वाहन प्रविष्टि दर्ज करें',
    watchmanSubmitting: 'प्रविष्टि दर्ज हो रही है...',
    watchmanEntriesTitle: 'मेरे द्वारा दर्ज आगंतुक वाहन',
    watchmanEntriesSubtitle: 'सुरक्षा गेट पर आपके द्वारा हाल ही में दर्ज किए गए बाहरी वाहन।',
    watchmanStatusInside: 'सोसाइटी के अंदर',
    watchmanStatusExited: 'गेट से बाहर गया',
    watchmanMarkExitedBtn: 'प्रस्थान चिह्नित करें',
    watchmanConfirmExit: 'पुष्टि करें कि यह वाहन सोसाइटी गेट से बाहर निकल चुका है?',
    watchmanEntrySuccess: 'आगंतुक वाहन सफलतापूर्वक दर्ज किया गया।',
    watchmanSearchEntriesPlaceholder: 'नंबर प्लेट या फ़ोन से खोजें...',
    watchmanNoEntriesTitle: 'अभी तक कोई आगंतुक वाहन दर्ज नहीं है',
    watchmanNoEntriesDesc: 'गेट पर आने वाली कारों या बाइकों को पंजीकृत करने के लिए ऊपर दिए गए फॉर्म का उपयोग करें।',

    // Admin Watchmen
    adminWatchmenBadge: 'गेट सुरक्षा गार्ड प्रबंधन',
    adminWatchmenTitle: 'सुरक्षा वॉचमैन खाते',
    adminWatchmenSubtitle: 'गेट पर बाहरी वाहनों को दर्ज करने के लिए अधिकृत वॉचमैन खातों का प्रबंधन करें।',
    adminWatchmenAddBtn: 'नया वॉचमैन खाता जोड़ें',
    adminWatchmenModalAddTitle: 'सुरक्षा वॉचमैन पंजीकृत करें',
    adminWatchmenModalEditTitle: 'वॉचमैन खाता संपादित करें',
    adminWatchmenModalSubtitle: 'गेट सुरक्षा गार्डों के लिए फ़ोन-आधारित लॉगिन क्रेडेंशियल बनाएं।',
    adminWatchmenStatusActive: 'सक्रिय',
    adminWatchmenStatusInactive: 'निष्क्रिय',
    adminWatchmenConfirmDelete: 'क्या आप इस वॉचमैन खाते को हमेशा के लिए हटाना चाहते हैं?',
    adminWatchmenEmpty: 'अभी तक कोई वॉचमैन खाता नहीं बनाया गया है। नया गार्ड जोड़ने के लिए ऊपर क्लिक करें।',

    // Admin Outsiders
    adminOutsidersBadge: 'आगंतुक प्रबंधन रजिस्ट्री',
    adminOutsidersTitle: 'आगंतुक व डिलीवरी वाहन',
    adminOutsidersSubtitle: 'सोसाइटी में पार्क किए गए सभी गैर-निवासी वाहनों का संपूर्ण रिकॉर्ड।',
    adminOutsidersStatTotal: 'कुल दर्ज आगंतुक',
    adminOutsidersStatInside: 'वर्तमान में अंदर',
    adminOutsidersStatExited: 'परिसर से बाहर गए',
    adminOutsidersSearchPlaceholder: 'नंबर प्लेट, फ़ोन, चालक नाम या विवरण से खोजें...',
    adminOutsidersFilterAll: 'सभी प्रविष्टियां',
    adminOutsidersFilterInside: 'वर्तमान में अंदर',
    adminOutsidersFilterExited: 'बाहर गए',
    adminOutsidersEmpty: 'सिस्टम में कोई आगंतुक वाहन प्रविष्टि दर्ज नहीं है।',

    // Owner Card additions
    ownerOutsiderBadge: 'आगंतुक / डिलीवरी वाहन',
    ownerVisitingPurpose: 'आगमन उद्देश्य / विवरण',
    ownerLoggedBy: 'गेट पर दर्जकर्ता वॉचमैन',
    ownerEntryTime: 'गेट प्रवेश समय',
    ownerVehicleStatus: 'परिसर स्थिति',

    footerSociety: 'शीतलधारा सीएचएस को-ऑपरेटिव हाउसिंग सोसाइटी लि.',
    footerTagline: 'निवासी सहायता प्रणाली • पार्किंग समाधान',
  },

  mr: {
    societyName: 'शीतलधारा सीएचएस',
    societyTitle: 'शीतलधारा को-ऑप हाउसिंग सोसायटी लि.',
    societySub: 'वाहन मालक शोध पोर्टल',
    residentPortal: 'रहिवासी पोर्टल',
    auditTrail: 'ऑडिट नोंदवही',
    flat: 'फ्लॅट',
    role: 'भूमिका',
    logout: 'बाहेर पडा',
    refresh: 'रिफ्रेश',
    cancel: 'रद्द करा',
    save: 'जतन करा',
    delete: 'हटवा',
    edit: 'बदला',
    add: 'जोडा',
    back: 'मागे',
    loading: 'लोड होत आहे...',
    phone: 'फोन',
    status: 'स्थिती',
    actions: 'कृती',
    time: 'वेळ',
    success: 'यशस्वी',
    error: 'त्रुटी',
    close: 'बंद करा',

    navSearch: 'वाहन शोधा',
    navMyVehicles: 'माझ्या फ्लॅटची वाहने',
    navResidents: 'रहिवासी नोंदवही',
    navAllVehicles: 'सर्व वाहने',
    navAuditLogs: 'शोध ऑडिट नोंदी',
    navWatchmen: 'वॉचमन',
    navOutsiders: 'पाहुण्यांची वाहने',
    navWatchmanGate: 'गेट कन्सोल',

    authPortalBadge: 'शीतलधारा सीएचएस',
    authTitle: 'सोसायटी वाहन शोध पोर्टल',
    authSubtitle: 'पार्किंग अडवणाऱ्या वाहनांच्या मालकांशी थेट व त्वरित संपर्क साधण्यासाठीचे पोर्टल.',
    authTabResident: 'रहिवासी लॉगिन',
    authTabAdmin: 'व्यवस्थापक लॉगिन',
    authTabWatchman: 'वॉचमन लॉगिन',
    authResidentTitle: 'रहिवासी लॉगिन',
    authResidentSubtitle: 'तुमचा खोली/फ्लॅट क्रमांक आणि नोंदणीकृत फोन नंबर टाका. पासवर्डची गरज नाही.',
    authAdminTitle: 'सोसायटी व्यवस्थापक लॉगिन',
    authAdminSubtitle: 'सोसायटी नोंदी व्यवस्थापित करण्यासाठी व्यवस्थापक फोन व पासवर्ड टाका.',
    authWatchmanTitle: 'गेट सुरक्षा वॉचमन लॉगिन',
    authWatchmanSubtitle: 'पाहुण्यांच्या वाहनांची नोंद करण्यासाठी तुमचा वॉचमन फोन नंबर आणि पासवर्ड टाका.',
    authFlatNumber: 'खोली / फ्लॅट क्रमांक',
    authFlatPlaceholder: 'उदा. B-304 किंवा A-101',
    authMobile: 'नोंदणीकृत मोबाईल नंबर',
    authMobilePlaceholder: '१० अंकी मोबाईल नंबर',
    authPassword: 'पासवर्ड',
    authPasswordPlaceholder: 'पासवर्ड टाका',
    authBtnResidentSignIn: 'रहिवासी म्हणून लॉगिन करा',
    authBtnAdminLogin: 'व्यवस्थापक लॉगिन करा',
    authBtnWatchmanLogin: 'गेट वॉचमन लॉगिन करा',
    authResidentDemoHint: 'चाचणी रहिवासी (भरण्यासाठी टॅप करा):',
    authAdminDemoHint: 'व्यवस्थापक खाते (भरण्यासाठी टॅप करा):',
    authWatchmanDemoHint: 'गेट वॉचमन (भरण्यासाठी टॅप करा):',
    authNotFoundNotice: "हा फ्लॅट आणि फोन नंबरचा ताळमेळ सापडला नाही. कृपया सोसायटी व्यवस्थापकाशी संपर्क साधा.",
    authContactAdmin: 'रहिवासी नोंदणी केवळ सोसायटी व्यवस्थापनाद्वारे केली जाते.',

    searchHeading: 'वाहन शोध',
    searchSubtitle: 'पार्किंग अडवणाऱ्या वाहनाच्या मालकाचा संपर्क त्वरित मिळवा.',
    searchLabel: 'नंबर प्लेट शोधा',
    searchPlaceholder: 'उदा. MH04AX4821 किंवा 4821',
    searchHint: 'Enter दाबून शोधा • साफ करण्यासाठी ESC',
    searchBtn: 'शोधा',
    searchBtnLoading: 'शोधत आहे...',
    quickExamples: 'चाचणी उदाहरणे',
    matchesFound: 'वाहने सापडली',
    selectModelBelow: 'खालीलपैकी मॉडेल निवडा',
    zeroMatchesTitle: 'या क्रमांकाचे वाहन सापडले नाही',
    zeroMatchesDesc: 'कृपया नंबर प्लेट तपासा किंवा सोसायटी सुरक्षारक्षकाशी संपर्क साधा.',
    selectOneOfVehicles: 'वाहनांपैकी एक निवडा',
    selectOneOfVehiclesDesc: 'पार्किंग अडवणाऱ्या वाहनाच्या रंगाशी किंवा मॉडेलशी जुळणाऱ्या पर्यायावर क्लिक करा.',
    welcomeCardBadge: 'शीतलधारा सीएचएस नोंदवही',
    welcomeCardTitle: 'त्वरित पार्किंग तोडगा',
    welcomeCardDesc: 'वाहनाचे शेवटचे ४ अंक (उदा. 4821) किंवा पूर्ण नंबर प्लेट टाकून मालकांशी थेट संपर्क साधा.',
    welcomePrivacy: 'गोपनीयता संरक्षण',
    welcomePrivacyVal: 'फक्त नोंदणीकृत रहिवासी',
    welcomeDuplicate: 'समान नंबर सहाय्य',
    welcomeDuplicateVal: 'मॉडेलनुसार ओळख',
    welcomeInstantDial: 'थेट कॉल',
    welcomeInstantDialVal: '१-क्लिक कॉलिंग',

    ownerMatchBadge: 'वाहन जुळले',
    ownerRegisteredVehicle: 'नोंदणीकृत सोसायटी वाहन',
    ownerNameLabel: 'मालकाचे नाव',
    ownerRoomLabel: 'खोली / फ्लॅट क्रमांक',
    ownerParkingLabel: 'पार्किंग जागा',
    ownerContactLabel: 'संपर्क फोन',
    ownerCallBtn: 'मालकाला कॉल करा',
    ownerCopyBtn: 'फोन नंबर कॉपी करा',
    ownerCopied: 'नंबर कॉपी झाला!',
    ownerBackBtn: 'यादीवर परत जा',
    ownerNone: 'नाही',

    myVehiclesBadge: 'माझ्या फ्लॅटच्या नोंदी',
    myVehiclesTitle: 'नोंदणीकृत वाहने',
    myVehiclesSubtitle: 'पार्किंग शोध सुविधेसाठी आपल्या फ्लॅटशी जोडलेली सर्व वाहने.',
    myVehiclesReadOnlyNotice: 'वाहन नोंदणी व व्यवस्थापन थेट सोसायटी व्यवस्थापकाद्वारे केले जाते. नवीन वाहन जोडण्यासाठी किंवा माहिती बदलण्यासाठी सोसायटी कार्यालयाशी संपर्क साधावा.',
    myVehiclesEmptyTitle: 'आपल्या फ्लॅटसाठी कोणतेही वाहन नोंदवलेले नाही',
    myVehiclesEmptyDesc: 'सोसायटी नोंदवहीत आपली कार किंवा दुचाकी नोंदवण्यासाठी व्यवस्थापकाशी संपर्क साधा.',
    myVehiclesBikeParkingNotice: 'दुचाकींसाठी निश्चित पार्किंग जागा नसते, ती मोकळ्या आवारात कुठेही पार्क केली जाऊ शकते.',
    bikeNoParkingSlot: 'मोकळे पार्किंग (कुठेही)',

    adminResidentsBadge: 'सोसायटी नोंदवही',
    adminResidentsTitle: 'रहिवासी व फ्लॅट नोंदवही',
    adminResidentsSubtitle: 'सोसायटीतील रहिवाशांची माहिती थेट जोडा, बदला किंवा हटवा. व्यवस्थापकाने टाकलेला डेटा त्वरित लागू होतो.',
    adminResidentsSearchPlaceholder: 'नाव, फ्लॅट किंवा फोन नंबरनुसार शोधा...',
    adminStatResidents: 'एकूण रहिवासी',
    adminStatVehicles: 'एकूण वाहने',
    adminStatFlats: 'सक्रिय फ्लॅट्स',
    adminBtnAddResident: 'नवीन रहिवासी जोडा',
    adminBtnEditResident: 'बदला',
    adminBtnDeleteResident: 'हटवा',
    adminModalAddResident: 'नवीन रहिवासी जोडा',
    adminModalEditResident: 'रहिवासी माहिती बदला',
    adminModalResidentSubtitle: 'खोली क्रमांक आणि फोन नंबर ही जोडीच रहिवाशाचे लॉगिन क्रेडेंशियल असेल.',
    adminFieldFullName: 'रहिवाशाचे पूर्ण नाव',
    adminFieldFullNamePlaceholder: 'उदा. प्रिया नायर',
    adminFieldRoomNumber: 'खोली / फ्लॅट क्रमांक',
    adminFieldRoomPlaceholder: 'उदा. B-304',
    adminFieldPhone: 'मोबाईल नंबर',
    adminFieldPhonePlaceholder: 'उदा. 9820022334',
    adminResidentVehiclesCount: 'वाहने',
    adminAddVehicleBtn: 'वाहन जोडा',
    adminDeleteResidentConfirm: 'आपण हा रहिवासी हटवू इच्छिता? या फ्लॅटची सर्व नोंदणीकृत वाहनेही हटवली जातील.',

    adminVehiclesBadge: 'सोसायटी वाहन नोंदवही',
    adminVehiclesTitle: 'शीतलधारा सीएचएस मधील सर्व वाहने',
    adminVehiclesSubtitle: 'सोसायटीतील सर्व चारचाकी व दुचाकी वाहनांची संपूर्ण नोंदवही. व्यवस्थापक थेट वाहने जोडू किंवा बदलू शकतात.',
    adminVehiclesSearchPlaceholder: 'नंबर, रहिवासी, फ्लॅट, कंपनीनुसार शोधा...',
    adminVehiclesStatTotal: 'एकूण वाहने',
    adminVehiclesStatCars: 'चारचाकी',
    adminVehiclesStatBikes: 'दुचाकी',
    adminVehiclesStatOther: 'इतर',
    adminVehiclesTablePlate: 'नंबर प्लेट',
    adminVehiclesTableType: 'प्रकार',
    adminVehiclesTableDetails: 'कंपनी व मॉडेल',
    adminVehiclesTableOwner: 'मालक',
    adminVehiclesTableParking: 'पार्किंग स्लॉट',
    adminVehiclesConfirmDelete: 'हे वाहन सोसायटी नोंदवहीतून हटवायचे का?',
    adminVehiclesEmpty: 'शोधाशी जुळणारे कोणतेही वाहन सापडले नाही.',
    adminVehiclesAddBtn: 'वाहन जोडा',
    adminVehiclesModalAddTitle: 'नवीन वाहन जोडा',
    adminVehiclesModalEditTitle: 'वाहन माहिती बदला',
    adminVehiclesModalSubtitle: 'सोसायटी रहिवाशासाठी वाहनाची नोंद थेट करा.',
    adminVehiclesSelectResident: 'नियुक्त रहिवासी / फ्लॅट',
    adminVehiclesTypeLabel: 'वाहन प्रकार',
    adminVehiclesTypeCar: 'चारचाकी (कार / एसयूव्ही)',
    adminVehiclesTypeBike: 'दुचाकी (बाईक / स्कूटर)',
    adminVehiclesTypeOther: 'इतर वाहन',
    adminVehiclesBrandLabel: 'कंपनी / मेक',
    adminVehiclesBrandPlaceholder: 'उदा. Honda, Maruti, Tata',
    adminVehiclesModelLabel: 'मॉडेल व रंग',
    adminVehiclesModelPlaceholder: 'उदा. City White, Nexon Grey, Activa',
    adminVehiclesPlateLabel: 'नंबर प्लेट',
    adminVehiclesPlatePlaceholder: 'उदा. MH04AX4821',
    adminVehiclesParkingLabel: 'पार्किंग स्लॉट (फक्त चारचाकींसाठी)',
    adminVehiclesParkingPlaceholder: 'उदा. P-24, B-12',

    adminLogsBadge: 'ऑडिट नोंदवही',
    adminLogsTitle: 'शोध ऑडिट नोंदी',
    adminLogsSubtitle: 'रहिवाशांनी केलेल्या सर्व नंबर प्लेट शोधांचा सुरक्षित इतिहास.',
    adminLogsResetSeed: 'चाचणी डेटा रीसेट करा',
    adminLogsTableTime: 'वेळ',
    adminLogsTableUser: 'शोधकर्ता रहिवासी',
    adminLogsTableFlat: 'फ्लॅट',
    adminLogsTableQuery: 'सर्च क्वेरी',
    adminLogsTableMatched: 'सापडलेली गाडी',
    adminLogsEmptyTitle: 'अद्याप कोणत्याही नोंदी नाहीत',
    adminLogsEmptyDesc: 'सुरक्षा नियमावलीनुसार रहिवाशांचे शोध येथे नोंदवले जातील.',
    adminLogsResetConfirm: 'डेटाबेस पुन्हा डीफॉल्ट चाचणी रेकॉर्डवर रीसेट करायचा का?',
    adminLogsResetSuccess: 'डेटाबेस डीफॉल्ट चाचणी डेटामध्ये पूर्ववत केला गेला.',

    // Watchman Console
    watchmanConsoleBadge: 'गेट सुरक्षा रक्षक कन्सोल',
    watchmanConsoleTitle: 'पाहुणे व बाहेरील वाहनांची नोंदणी',
    watchmanConsoleSubtitle: 'सोसायटी आवारात पार्क केलेल्या पाहुण्यांच्या किंवा डिलिव्हरी वाहनांची नोंद ठेवा जेणेकरून रहिवासी त्यांच्याशी संपर्क साधू शकतील.',
    watchmanFormTitle: 'नवीन पाहुण्याच्या वाहनाची नोंद करा',
    watchmanFormSubtitle: 'गेटवर येताच वाहनाचा नंबर आणि चालकाचा मोबाईल नंबर नोंदवा.',
    watchmanPlateLabel: 'वाहन नंबर प्लेट',
    watchmanPlatePlaceholder: 'उदा. MH04BX9921',
    watchmanVehicleTypeLabel: 'वाहन प्रकार',
    watchmanOwnerPhoneLabel: 'चालक / मालकाचा फोन नंबर',
    watchmanOwnerPhonePlaceholder: '१० अंकी मोबाईल नंबर',
    watchmanOwnerNameLabel: 'चालक / मालकाचे नाव (ऐच्छिक)',
    watchmanOwnerNamePlaceholder: 'उदा. राजेश कुमार किंवा झोमॅटो डिलिव्हरी',
    watchmanNoteLabel: 'येण्याचे कारण / फ्लॅट तपशील (ऐच्छिक)',
    watchmanNotePlaceholder: 'उदा. फ्लॅट B-304 मध्ये पाहुणे, पार्सल डिलिव्हरी',
    watchmanSubmitBtn: 'वाहनाची नोंद करा',
    watchmanSubmitting: 'नोंद होत आहे...',
    watchmanEntriesTitle: 'माझ्या नोंदवलेल्या नोंदी',
    watchmanEntriesSubtitle: 'सुरक्षा गेटवर तुम्ही नोंदवलेली पाहुण्यांची वाहने.',
    watchmanStatusInside: 'सोसायटीत उपस्थित',
    watchmanStatusExited: 'गेटमधून बाहेर गेले',
    watchmanMarkExitedBtn: 'बाहेर पडल्याची नोंद करा',
    watchmanConfirmExit: 'हे वाहन सोसायटी गेटमधून बाहेर पडल्याची खात्री करा?',
    watchmanEntrySuccess: 'पाहुण्याच्या वाहनाची नोंद यशस्वीपणे झाली.',
    watchmanSearchEntriesPlaceholder: 'नंबर प्लेट किंवा फोन नंबरने शोधा...',
    watchmanNoEntriesTitle: 'अद्याप कोणत्याही पाहुण्यांची वाहने नोंदलेली नाहीत',
    watchmanNoEntriesDesc: 'गेटवर येणाऱ्या गाड्यांची नोंद करण्यासाठी वरील फॉर्म वापरा.',

    // Admin Watchmen
    adminWatchmenBadge: 'गेट सुरक्षा रक्षक व्यवस्थापन',
    adminWatchmenTitle: 'सुरक्षा वॉचमन खाती',
    adminWatchmenSubtitle: 'गेटवर बाहेरील वाहनांची नोंद करण्यासाठी अधिकृत वॉचमन खाती व्यवस्थापित करा.',
    adminWatchmenAddBtn: 'नवीन वॉचमन खाते जोडा',
    adminWatchmenModalAddTitle: 'सुरक्षा वॉचमन नोंदणी करा',
    adminWatchmenModalEditTitle: 'वॉचमन खाते संपादित करा',
    adminWatchmenModalSubtitle: 'गेट सुरक्षा रक्षकांसाठी फोन-आधारित लॉगिन तयार करा.',
    adminWatchmenStatusActive: 'सक्रिय',
    adminWatchmenStatusInactive: 'निष्क्रिय',
    adminWatchmenConfirmDelete: 'हे वॉचमन खाते कायमचे हटवायचे का?',
    adminWatchmenEmpty: 'अद्याप कोणतेही वॉचमन खाते तयार केलेले नाही. नवीन रक्षक जोडण्यासाठी वर क्लिक करा.',

    // Admin Outsiders
    adminOutsidersBadge: 'पाहुणे वाहन नोंदवही',
    adminOutsidersTitle: 'पाहुणे व डिलिव्हरी वाहने',
    adminOutsidersSubtitle: 'सोसायटीमध्ये पार्क केलेल्या सर्व बाहेरील पाहुण्यांच्या आणि डिलिव्हरी वाहनांची नोंद.',
    adminOutsidersStatTotal: 'एकूण नोंदवलेली वाहने',
    adminOutsidersStatInside: 'सध्या आवारात उपस्थित',
    adminOutsidersStatExited: 'आवारातून बाहेर गेलेली',
    adminOutsidersSearchPlaceholder: 'नंबर प्लेट, फोन, नाव किंवा कारणाने शोधा...',
    adminOutsidersFilterAll: 'सर्व नोंदी',
    adminOutsidersFilterInside: 'सध्या आवारात',
    adminOutsidersFilterExited: 'बाहेर पडलेली',
    adminOutsidersEmpty: 'प्रणालीमध्ये पाहुण्यांच्या वाहनांची कोणतीही नोंद नाही.',

    // Owner Card additions
    ownerOutsiderBadge: 'पाहुणे / डिलिव्हरी वाहन',
    ownerVisitingPurpose: 'येण्याचे कारण / तपशील',
    ownerLoggedBy: 'गेटवर नोंदवणारा वॉचमन',
    ownerEntryTime: 'गेट प्रवेश वेळ',
    ownerVehicleStatus: 'आवार स्थिती',

    footerSociety: 'शीतलधारा को-ऑप हाउसिंग सोसायटी लि.',
    footerTagline: 'रहिवासी सहाय्यता प्रणाली • पार्किंग तोडगा',
  },
};

interface LanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('society_lang') as Language;
      if (saved === 'en' || saved === 'hi' || saved === 'mr') {
        return saved;
      }
    }
    return 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('society_lang', lang);
    }
  };

  const t = translations[language] || translations.en;

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextValue => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
