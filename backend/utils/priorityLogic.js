const determineUrgency = (event) => {
    // If it's a venue change or happening in less than 2 hours, it's CRITICAL
    const hoursUntilEvent = (new Date(event.date) - new Date()) / (1000 * 60 * 60);
    
    if (event.title.toLowerCase().includes("urgent") || hoursUntilEvent < 2) {
        return "CRITICAL";
    }
    return "NORMAL";
};

export { determineUrgency };