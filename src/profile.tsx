import { useState, useRef, ChangeEvent, CSSProperties, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // For web navigation

// --- Asset Imports (adjust paths as needed) ---
import defaultAvatar from '/home/user/onefitforallvite/src/assets/images/default_avatar.png';
import editProfilePicIcon from '/home/user/onefitforallvite/src/assets/images/editProfilePic.png';
import editUsernameIcon from '/home/user/onefitforallvite/src/assets/images/editUsername.png';
import settingsIconSrc from '/home/user/onefitforallvite/src/assets/images/settings.png';

// --- Colors Import (adjust path as needed) ---
//import { Colors } from './colors'; // Make sure this path is correct
import { auth } from './firebase';
import { getAuth, updateProfile } from 'firebase/auth';
import { useTheme } from './ThemeContext';


export default function ProfileScreen() {
  const { theme } = useTheme();
  // --- Styles Definition ---
  const styles: { [key: string]: CSSProperties } = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.background || '#f7f7f7',
      boxSizing: 'border-box',

    },
    headerContainer: {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: '100%',
      alignItems: 'center',
      marginBottom: 30,
    },
    headerText: {
      fontSize: 28, // Slightly larger for web
      fontWeight: 'bold',
      color: theme.textPrimary || '#333',
    },
    settingsIcon: {
      width: 30,
      height: 30,
      cursor: 'pointer',
      // tintColor: Colors.textPrimary, // OMITTED - For SVGs, use 'fill'
    },
    profilePicContainer: {
      marginBottom: 20,
      alignItems: 'center',
      position: 'relative', // For positioning the edit button
    },
    profilePic: {
      width: 150,
      height: 150,
      borderRadius: '50%', // Perfect circle
      backgroundColor: '#e0e0e0', // Placeholder background
      border: `1px solid ${theme.textPrimary || '#ccc'}`,
      objectFit: 'cover', // Ensure image covers the area
      display: 'block',
    },
    editPicButton: {
      position: 'absolute',
      bottom: 5,
      right: 5,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      padding: 0, // Remove padding if icon fills it
      borderRadius: '50%',
      width: 36, // Button size
      height: 36,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      cursor: 'pointer',
      border: 'none',
    },
    editIcon: {
      width: 18,
      height: 18,
      filter: 'invert(100%) brightness(200%)',
    },
    usernameContainer: {
      alignItems: 'center',
      marginBottom: 10,
      width: '100%',
      justifyContent: 'center', // Add to center content horizontally
      display: 'flex', // Ensure it's a flex container
    },
    displayUsernameView: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
    },
    usernameText: {
      color: theme.textPrimary || '#333',
      fontSize: 24,
      fontWeight: 'bold',
      marginRight: 10,
    },
    editUsernameView: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      borderBottom: `1px solid ${theme.textPrimary || '#ccc'}`,
      paddingBottom: 5,
      width: '100%',
    },
    usernameInput: {
      fontSize: 24,
      fontWeight: 'bold',
      padding: '8px 5px', // Web inputs often need more padding
      border: 'none', // Remove default input border
      outline: 'none', // Remove focus outline (can be styled differently)
      flexGrow: 1, // Allow input to take available space
      marginRight: 10,
      backgroundColor: 'transparent',
      color: theme.textPrimary || '#333',
    },
    iconButton: { // General style for icon-like buttons
      padding: 8,
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    editUsernameIcon: {
      width: 24,
      height: 24,
      // tintColor: Colors.textPrimary, // OMITTED
    },
    // Simple text buttons for save/cancel
    actionButtonText: {
      fontSize: 16,
      padding: '5px 10px',
      cursor: 'pointer',
      borderRadius: 4,
    },
    saveButtonText: {
      color: 'green',
      // backgroundColor: '#e6ffe6',
      marginRight: 5,
    },
    cancelButtonText: {
      color: 'red',
      // backgroundColor: '#ffe6e6',
    }
  };

  const [username, setUsername] = useState("");
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [tempUsername, setTempUsername] = useState("");
  const [profilePicUri, setProfilePicUri] = useState<string | null>(null);
  const navigate = useNavigate(); // For web navigation
  const fileInputRef = useRef<HTMLInputElement>(null); // Ref for the hidden file input
  useEffect(() => {
    if (tempUsername === "") {
      setTempUsername(auth.currentUser?.displayName ?? auth.currentUser?.email ?? "User");

    }
    setUsername(auth.currentUser?.displayName ?? auth.currentUser?.email ?? "User")
  }, [tempUsername])

  // No explicit permission request needed for web file input
  // The useEffect for ImagePicker permissions is removed.

  const handleImageSelected = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicUri(reader.result as string);
        // TODO: Implement logic to upload the selected image (file object) to your server/storage
        console.log('Profile Picture Selected (Web):', file.name);
        // window.alert('Profile Picture Updated (Web)'); // Or use a toast/modal
      };
      reader.readAsDataURL(file); // Creates a base64 URI for display
    }
  };

  const handleEditPicture = () => {
    // Trigger click on the hidden file input
    fileInputRef.current?.click();
  };

  const handleEditUsername = () => {
    setIsEditingUsername(true);
  };

  const handleSaveUsername = () => {
    updateProfile(getAuth().currentUser!, { displayName: tempUsername })
    setUsername(tempUsername)
    setIsEditingUsername(false);
    auth.currentUser?.reload();
    // TODO: Add logic to save the username persistently (e.g., API call)
    console.log('Username Saved (Web):', tempUsername);
    // window.alert(`Username changed to: ${tempUsername}`);
  };

  const handleCancelEditUsername = () => {
    setIsEditingUsername(false);
  };

  const navigateToSettings = () => {
    navigate('/settings'); // Adjust route as per your web router setup
  };

  return (
    <div style={styles.container}>
      {/* Hidden file input for image selection */}
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleImageSelected}
      />

      {/* Header Section */}
      <div style={styles.headerContainer}>
        <h1 style={styles.headerText}>Profile</h1>
        <button onClick={navigateToSettings} style={styles.iconButton} aria-label="Settings">
          <img src={settingsIconSrc} alt="Settings" style={styles.settingsIcon} />
        </button>
      </div>

      {/* Profile Picture Section */}
      <div style={styles.profilePicContainer}>
        <img
          src={profilePicUri || defaultAvatar}
          alt="Profile"
          style={styles.profilePic}
        />
        <button style={styles.editPicButton} onClick={handleEditPicture} aria-label="Edit profile picture">
          <img src={editProfilePicIcon} alt="Edit" style={styles.editIcon} />
        </button>
      </div>

      {/* Username Section */}
      <div style={styles.usernameContainer}>
        {isEditingUsername ? (
          <div style={styles.editUsernameView}>
            <input
              type="text"
              style={styles.usernameInput}
              value={tempUsername}
              onChange={(e) => setTempUsername(e.target.value)}
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleSaveUsername()}
            />
            {/* Using text for save/cancel for simplicity. Replace with actual icons. */}
            <button onClick={handleSaveUsername} style={{ ...styles.iconButton, ...styles.actionButtonText, ...styles.saveButtonText }}>
              Save {/* Replace with Checkmark Icon component */}
            </button>
            <button onClick={handleCancelEditUsername} style={{ ...styles.iconButton, ...styles.actionButtonText, ...styles.cancelButtonText }}>
              Cancel {/* Replace with Close Icon component */}
            </button>
          </div>
        ) : (
          <div style={styles.displayUsernameView}>
            <span style={styles.usernameText}>{username}</span>
            <button onClick={handleEditUsername} style={styles.iconButton} aria-label="Edit username">
              <img src={editUsernameIcon} alt="Edit username" style={styles.editUsernameIcon} />
            </button>
          </div>
        )}
      </div>

      {/* Other Profile Info (Placeholder) */}
      {/* You would add Goal and Friends sections here using standard HTML/React components */}
    </div>
  );
}