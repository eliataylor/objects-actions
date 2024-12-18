APPLE_BUNDLE_ID=com..app
APPLE_TEAM_ID=8YB35H76CJ

APPLE_KEY_ID=9SD5BW3HVN
APPLE_KEY_PATH=./keys/AuthKey_9SD5BW3HVN.p8

# APPLE_KEY_ID=8XC53LLBF6
# APPLE_KEY_PATH=./keys/AuthKey_8XC53LLBF6.p8
JWT_FILE="apple_developer_token.jwt"

JWT_HEADER=$(echo -n '{"alg":"ES256","kid":"'$APPLE_KEY_ID'"}' | openssl base64 -e -A | tr '+/' '-_' | tr -d '=')
JWT_CLAIMS=$(echo -n '{"iss":"'$APPLE_TEAM_ID'","iat":'$(date +%s)',"exp":'$(($(date +%s) + 15777000))'}' | openssl base64 -e -A | tr '+/' '-_' | tr -d '=')
JWT_SIGNATURE=$(echo -n "$JWT_HEADER.$JWT_CLAIMS" | openssl dgst -sha256 -sign $APPLE_KEY_PATH | openssl base64 -e -A | tr '+/' '-_' | tr -d '=')
JWT="$JWT_HEADER.$JWT_CLAIMS.$JWT_SIGNATURE"

echo $JWT > $JWT_FILE
echo "JWT saved to $JWT_FILE"
