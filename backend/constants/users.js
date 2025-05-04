
exports.UserTypes = {

    ADMIN: 'admin',
    COACH: 'coach',
    IN_CHARGE: 'balagruha in-charge',
    STUDENT: 'student',
    PURCHASE_MANAGER: 'purchase-manager',
    MEDICAL_IN_CHARGE: 'medical-incharge',
    SPORTS_COACH: 'sports-coach',
    MUSIC_COACH: 'music-coach',
    AMMA: 'amma'
}


// User type hierarchy 
exports.userTypeHierarchy = {
    'admin': [this.UserTypes.ADMIN, this.UserTypes.COACH, this.UserTypes.IN_CHARGE, this.UserTypes.STUDENT, this.UserTypes.PURCHASE_MANAGER, this.UserTypes.MEDICAL_IN_CHARGE, this.UserTypes.SPORTS_COACH, this.UserTypes.MUSIC_COACH, this.UserTypes.AMMA],
    'balagruha in-charge': [this.UserTypes.ADMIN, this.UserTypes.COACH, this.UserTypes.IN_CHARGE, this.UserTypes.STUDENT, this.UserTypes.PURCHASE_MANAGER, this.UserTypes.MEDICAL_IN_CHARGE, this.UserTypes.SPORTS_COACH, this.UserTypes.MUSIC_COACH, this.UserTypes.AMMA],
    'coach': [this.UserTypes.ADMIN, this.UserTypes.COACH, this.UserTypes.STUDENT, this.UserTypes.SPORTS_COACH, this.UserTypes.MUSIC_COACH, this.UserTypes.AMMA, this.UserTypes.IN_CHARGE, this.UserTypes.MEDICAL_IN_CHARGE, this.UserTypes.PURCHASE_MANAGER],
    'student': [this.UserTypes.STUDENT],
    'purchase-manager': [this.UserTypes.ADMIN, this.UserTypes.COACH, this.UserTypes.STUDENT, this.UserTypes.SPORTS_COACH, this.UserTypes.MUSIC_COACH, this.UserTypes.AMMA, this.UserTypes.IN_CHARGE, this.UserTypes.MEDICAL_IN_CHARGE, this.UserTypes.PURCHASE_MANAGER],
    'medical-incharge': [this.UserTypes.ADMIN, this.UserTypes.COACH, this.UserTypes.STUDENT, this.UserTypes.SPORTS_COACH, this.UserTypes.MUSIC_COACH, this.UserTypes.AMMA, this.UserTypes.IN_CHARGE, this.UserTypes.MEDICAL_IN_CHARGE, this.UserTypes.PURCHASE_MANAGER],
    'sports-coach': [this.UserTypes.ADMIN, this.UserTypes.COACH, this.UserTypes.STUDENT, this.UserTypes.SPORTS_COACH, this.UserTypes.MUSIC_COACH, this.UserTypes.AMMA, this.UserTypes.IN_CHARGE, this.UserTypes.MEDICAL_IN_CHARGE, this.UserTypes.PURCHASE_MANAGER],
    'music-coach': [this.UserTypes.ADMIN, this.UserTypes.COACH, this.UserTypes.STUDENT, this.UserTypes.SPORTS_COACH, this.UserTypes.MUSIC_COACH, this.UserTypes.AMMA, this.UserTypes.IN_CHARGE, this.UserTypes.MEDICAL_IN_CHARGE, this.UserTypes.PURCHASE_MANAGER],
    'amma': [this.UserTypes.ADMIN, this.UserTypes.COACH, this.UserTypes.STUDENT, this.UserTypes.SPORTS_COACH, this.UserTypes.MUSIC_COACH, this.UserTypes.AMMA, this.UserTypes.IN_CHARGE, this.UserTypes.MEDICAL_IN_CHARGE, this.UserTypes.PURCHASE_MANAGER],
}