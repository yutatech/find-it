class SessionController:
    def __init__(self):
        self.labels = []
        self.sessions = {}

    def create_session(self, sid):
        self.sessions[sid] = {"sid": sid, "target_label": None}

    def get_target_label(self, sid):
        if sid in self.sessions:
            if "target_label" in self.sessions[sid]:
                return self.sessions[sid]["target_label"]
        return None
    
    def set_target_label(self, sid, target_label):
        if sid in self.sessions:
            self.sessions[sid]["target_label"] = target_label
            return True
        return False
    
    def get_labels(self, sid):
        return self.labels

    def delete_session(self, sid):
        del self.sessions[sid]
