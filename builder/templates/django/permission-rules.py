# from rest_framework.permissions import IsAuthenticated, BasePermission
from rest_framework import permissions

"""
If own and others are both defined   
    If different       
        Check roles and ownership
    Else if same:       
        Only check roles

If only own is defined:    
    Check role and ownership.    
        Others falls back False

If only others is defined:     
    Check role and ownership      
        Own falls back to False

If neither is defined     
    Fallback on default permission 

——

If verb has list or detail:    
    Apply named permission at retrieve and list actions separately. 
    Named permission just tests role and ownership.

"""


###### USERS PERMISSIONS ######

perm_simple = """class can___VERB_____MACHINE__(permissions):
    def has_permission(self, request, view):
        __AUTH_RULES__"""

perm_ctx = """class can___VERB_____MACHINE__(permissions):
    def has_permission(self, request, view):
        __AUTH_RULES__

    def has_object_permission(self, request, view, obj):
        __CTX_RULES__"""
